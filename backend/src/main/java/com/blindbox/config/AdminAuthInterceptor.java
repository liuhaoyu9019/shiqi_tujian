package com.blindbox.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Value("${admin.token:admin-token-change-me}")
    private String adminToken;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        String token = request.getHeader("X-Admin-Token");
        // 恒定时间比较，防止时序攻击
        if (token == null || !MessageDigest.isEqual(
                token.getBytes(StandardCharsets.UTF_8),
                adminToken.getBytes(StandardCharsets.UTF_8))) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未授权访问\"}");
            return false;
        }
        return true;
    }
}
