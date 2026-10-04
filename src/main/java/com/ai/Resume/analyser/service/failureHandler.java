package com.ai.Resume.analyser.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class failureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        String host = request.getHeader("host");
        String referer = request.getHeader("referer");
        String redirectUrl = "/login";
        if ((host != null && host.contains("localhost")) || (referer != null && referer.contains("5173"))) {
            redirectUrl = "http://localhost:5173/login";
        }
        response.sendRedirect(redirectUrl);
    }
}
