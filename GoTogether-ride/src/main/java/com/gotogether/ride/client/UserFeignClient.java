package com.gotogether.ride.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.gotogether.ride.dto.UserCompactDTO;

import java.util.List;

@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:8080}")
public interface UserFeignClient {

    @GetMapping("/gotogether/users/public/{id}/compact")
    UserCompactDTO getCompactUser(@PathVariable("id") Long userId);

    @PostMapping("/gotogether/users/public/compact/batch")
    List<UserCompactDTO> getCompactUsersBatch(@RequestBody List<Long> userIds);

    @GetMapping("/gotogether/users/public/compact/all")
    List<UserCompactDTO> getAllCompactUsers();
}