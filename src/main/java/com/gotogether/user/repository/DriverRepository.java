package com.gotogether.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gotogether.user.entity.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {

}
