package com.gotogether.user.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApiResponse {
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime timeStamp;
	private String message;
	private String status;
	private Object data;
	
	public ApiResponse(String message, String status) {
		super();
		this.timeStamp = LocalDateTime.now();
		this.message = message;
		this.status = status;
	}
	
	public ApiResponse(String message, String status, Object data) {
		super();
		this.timeStamp = LocalDateTime.now();
		this.message = message;
		this.status = status;
		this.data = data;
	}
}
