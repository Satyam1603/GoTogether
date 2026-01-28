package com.gotogether.user.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AttributeOverride(name = "id", column = @Column(name = "driver_id"))
@ToString(callSuper = true, exclude = "userDetails")
public class Driver extends BaseEntity{
	
	@PositiveOrZero(message = "Experience cannot be negative")
	@Column(name = "driving_experience", nullable = false)
	private int drivingExperience;
	
	@Column(name = "license_no", unique = true, nullable = false)
	private String licenseNo;
	
	@Column(name = "total_rides_given", nullable = false)
	@PositiveOrZero(message = "Total rides cannot be negative")
	private int totalRidesGiven = 0;
	
	@Min(value = 1, message = "Rating must be at least 1")
	@Max(value = 5, message = "Rating can't be at more than 5")
	private Integer rating;
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "user_id", nullable = false)
	private User userDetails;

	public Driver(int drivingExperience, String licenseNo, int totalRidesGiven, Integer rating) {
		super();
		this.drivingExperience = drivingExperience;
		this.licenseNo = licenseNo;
		this.totalRidesGiven = totalRidesGiven;
		this.rating = rating;
	}

		
		
}
