package com.example.notifications;

import io.github.cdimascio.dotenv.Dotenv;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.security.Security;

@SpringBootApplication
@EnableScheduling
public class NotificationsApplication {

	static {
		Security.addProvider(new BouncyCastleProvider());
	}

	public static void main(String[] args) {
		// טעינת הקובץ .env לתוך משתני המערכת
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		System.setProperty("java.net.preferIPv4Stack", "true");
		SpringApplication.run(NotificationsApplication.class, args);
	}
}