import os
import io
import json
import re
import pytesseract
from PIL import Image
import ollama
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

# הגדרת נתיב ה-Tesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# אתחול אפליקציית FastAPI
app = FastAPI(title="Medical Label OCR & Extraction API")

def extract_text_from_image(image_bytes: bytes) -> str:
    """מקבל את בייטים של התמונה, מבצע המרה ומחלץ טקסט"""
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img_rgb = img.convert('RGB')
            custom_config = r'--psm 6'
            extracted_text = pytesseract.image_to_string(img_rgb, lang='heb+eng', config=custom_config)
            
            # הדפסת הטקסט הגולמי לטרמינל של השרת
            print("\n--- הטקסט שזוהה מה-OCR ---")
            print(extracted_text if extracted_text.strip() else "[לא זוהה טקסט בתמונה]")
            print("---------------------------\n")
            
            return extracted_text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"שגיאה בעיבוד התמונה: {str(e)}")

def extract_number_from_text(text_value) -> int:
    """פונקציית עזר השולפת את המספר הראשון מתוך מחרוזת טקסט"""
    if not text_value:
        return 0
    # חיפוש רצף של ספרות בטקסט
    match = re.search(r'\d+', str(text_value))
    return int(match.group()) if match else 0

def analyze_text_with_llm(extracted_text: str) -> dict:
    """שולח את הטקסט ל-Ollama ומחזיר אובייקט JSON מפוענח ומעובד"""
    # הפרומפט המקורי והמדויק   !
    prompt = f"""
You are an expert medical data extraction assistant. Analyze the following text extracted from a Hebrew medicine label.
Your task is to extract specific details and return them ONLY as a raw JSON object.

CRITICAL INSTRUCTIONS:
- The JSON KEYS must be exactly as written below in English. Do not change or translate the keys.
- For "dosage": Extract the exact amount/quantity of the medicine taken at one time (e.g., "1 טבליות", "5 מ"ל"). Pay close attention to numbers near words like טבליות, TABS, or כדורים.
- For "frequency": Extract how many times a day the medicine should be taken, and format it exactly as "X פעמים ביום" (e.g., "2 פעמים ביום").
- For "duration": Extract the total duration of the treatment (e.g., "7 ימים").

Fields to extract (Use these exact keys):
1. "medicine_name"
2. "issue_date"
3. "dosage"
4. "frequency"
5. "duration"

Text to analyze:
{extracted_text}
"""
    try:
        response = ollama.chat(
            model='qwen2.5:latest', 
            format='json', 
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        json_string = response['message']['content'].strip()
        data = json.loads(json_string)
        
        # זיקוק שדה התדירות (frequency) למספר בלבד
        raw_frequency = data.get('frequency', '')
        data['frequency'] = extract_number_from_text(raw_frequency)
        
        # זיקוק שדה משך הזמן (duration) למספר בלבד
        raw_duration = data.get('duration', '')
        data['duration'] = extract_number_from_text(raw_duration)
        
        # הדפסת התוצאה הסופית המובנית לטרמינל של השרת
        print("--- התוצאה הסופית המפוענחת ---")
        print("שם התרופה:", data.get('medicine_name'))
        print("תאריך הנפקה:", data.get('issue_date'))
        print("מינון:", data.get('dosage'))
        print("תדירות (מספר בלבד):", data.get('frequency'))
        print("למשך זמן (מספר בלבד):", data.get('duration'))
        print("--------------------------------\n")
        
        return data
        
    except json.JSONDecodeError:
        print("שגיאה: המודל לא החזיר מבנה JSON תקין. הנה התשובה הגולמית:")
        print(response['message']['content'])
        raise HTTPException(status_code=500, detail="המודל לא החזיר מבנה JSON תקין")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"שגיאה בפנייה למודל: {str(e)}")


@app.post("/extract-label")
async def extract_label_endpoint(file: UploadFile = File(...)):
    """
    נקודת קצה שמקבלת קובץ תמונה, מדפיסה לטרמינל ומחזירה JSON ללקוח
    """
    print(f"התקבלה בקשה חדשה עבור הקובץ: {file.filename}")
    
    # 1. קריאת הקובץ
    image_bytes = await file.read()
    
    # 2. חילוץ טקסט והדפסתו
    extracted_text = extract_text_from_image(image_bytes)
    
    if not extracted_text.strip():
        return JSONResponse(
            status_code=422, 
            content={"error": "לא ניתן היה לזהות טקסט בתמונה שסופקה."}
        )
    
    # 3. ניתוח הטקסט והדפסת התוצאות המובנות
    final_data = analyze_text_with_llm(extracted_text)
    
    # 4. החזרת ה-JSON כגוף התשובה (Response)
    return JSONResponse(content=final_data)

if __name__ == "__main__":
    import uvicorn
    # הרצת השרת על פורט 5000 כפי שמוגדר ב-Java
    uvicorn.run(app, host="127.0.0.1", port=5000)