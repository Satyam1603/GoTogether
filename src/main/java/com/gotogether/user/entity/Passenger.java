package com.gotogether.user.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "passengers")
@Getter
@Setter
@NoArgsConstructor
@AttributeOverride(name = "id", column = @Column(name = "passenger_id"))
@ToString(callSuper = true, exclude = "userDetails")
public class Passenger extends BaseEntity{
	
	@Min(value = 1, message = "Rating must be at least 1")
	@Max(value = 5, message = "Rating can't be at more than 5")
	@Column(name = "passenger_rating")
	private Integer passengerRating;
	
	@Column(name = "total_rides_taken", nullable = false)
	@PositiveOrZero(message = "Total rides cannot be negative")
	private int totalRidesTaken = 0;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "payment_method", nullable = false)
	private PaymentType paymentMethod;
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "user_id", nullable = false)
	private User userDetails;

	public Passenger(Integer passengerRating, int totalRidesTaken, PaymentType paymentMethod) {
		super();
		this.passengerRating = passengerRating;
		this.totalRidesTaken = totalRidesTaken;
		this.paymentMethod = paymentMethod;
	}
	
	
}
