package com.blindbox.controller;

import com.blindbox.common.Result;
import com.blindbox.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/dashboard")
    public Result<Map<String, Object>> dashboard() {
        return Result.ok(statsService.getDashboard());
    }

    @PostMapping("/visit")
    public Result<Void> logVisit(
            @RequestBody Map<String, Object> body) {
        String pagePath = (String) body.getOrDefault("pagePath", "");
        String pageName = (String) body.getOrDefault("pageName", "");
        Long userId = body.get("userId") != null ? ((Number) body.get("userId")).longValue() : null;
        String ip = (String) body.getOrDefault("ip", "");
        statsService.logVisit(pagePath, pageName, userId, ip);
        return Result.ok(null);
    }
}
