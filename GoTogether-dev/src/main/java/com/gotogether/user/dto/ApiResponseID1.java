package com.gotogether.user.dto;



import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApiResponseID1 {
	private LocalDateTime timeStamp;
	private String message;
	private String status;
	private Long userId;
	public ApiResponseID1(String message, String status,Long long1) {
		super();
		this.timeStamp = LocalDateTime.now();
		this.message = message;
		this.status = status;
		this.userId = long1;
	}

}
