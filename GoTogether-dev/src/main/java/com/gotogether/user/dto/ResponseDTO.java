package com.gotogether.user.dto;

import com.gotogether.user.entity.User;

import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@Data
public
 class ResponseDTO {
	private boolean status;
	private User user;
	

}
