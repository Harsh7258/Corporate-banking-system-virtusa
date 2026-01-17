package org.example.exception;

public class UnauthAccessDeniedException extends RuntimeException {
    public UnauthAccessDeniedException(String message) {
        super(message);
    }
}
