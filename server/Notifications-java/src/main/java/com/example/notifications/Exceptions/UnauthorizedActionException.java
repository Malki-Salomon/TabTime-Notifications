package com.example.notifications.Exceptions;

public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) { super(message); }
}