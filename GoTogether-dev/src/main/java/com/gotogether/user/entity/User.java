package com.gotogether.user.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "users")
@AttributeOverride(name = "id", column = @Column(name = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true, exclude = {"password", "confirmPassword"})
public class User extends BaseEntity {
	
	@Column(name = "first_name", length = 30)
	private String firstName;
	
	@Column(name = "last_name", length = 30)
	private String lastName;
	
	@Column(length = 50,nullable = true, unique = true)
	private String email;
	
	@Column(length = 300, nullable = false)
	private String password;
	
	@Transient
	private String confirmPassword;
	
	@Column(unique = true, length = 15)
	private String phoneNo;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserRole role;
	
	@Lob
	@Column(columnDefinition = "MEDIUMBLOB") //allows images up to 16MB
	private byte[] image;

	// New: store S3 image URL (nullable)
	@Column(name = "image_url", length = 1000)
	private String imageUrl;
	private String preferences;
	
	@Column(name = "email_verified", nullable = false)
	private boolean emailVerified = false;
	@Column(name = "phone_verified", nullable = false)
	private boolean phoneVerified = false; 	

	public User(String firstName, String lastName, String email, String password, String confirmPassword,
			String phoneNo, UserRole role, byte[] image) {
		super();
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
		this.confirmPassword = confirmPassword;
		this.phoneNo = phoneNo;
		this.role = role;
		this.image = image;
	}
}