package com.gotogether.user.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    /*n Spring Boot, the constructor runs before @Value fields are injected. 
     * So when the constructor runs, accountSid and authToken are still null.*/
    /*You must move the initialization logic to a method annotated with @PostConstruct. 
     * This ensures it runs after Spring has injected the values from application.properties.*/
    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public void sendSMS(String to, String message) {
        Message.creator(
                new PhoneNumber(to),
                new PhoneNumber(twilioPhoneNumber),
                message
        ).create();
    }
    
    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;
    @Value("${sendgrid.from.email}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
    	System.out.println("DEBUG: Attempting to send email to " + to);
        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);
        
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
        	request.setMethod(Method.POST);
			request.setEndpoint("mail/send");
			request.setBody(mail.build());
			Response response = sg.api(request);
			if(response.getStatusCode() >= 400) {
				System.err.println("Error sending email: " + response.getBody());
			}
        }catch (IOException ex) {
        	ex.printStackTrace();
        }
    }
}