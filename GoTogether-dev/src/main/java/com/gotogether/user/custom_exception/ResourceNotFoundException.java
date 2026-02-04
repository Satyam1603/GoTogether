package com.gotogether.user.custom_exception;

public class ResourceNotFoundException extends RuntimeException {
		public ResourceNotFoundException(String message) {
		super(message);
	}

}
