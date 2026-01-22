package com.gotogether.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gotogether.user.entity.Passenger;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {

}
