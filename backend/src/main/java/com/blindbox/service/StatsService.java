package com.blindbox.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blindbox.entity.VisitLog;
import com.blindbox.mapper.VisitLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final VisitLogMapper visitLogMapper;

    public Map<String, Object> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();

        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(6);

        // 总访问量
        long totalVisits = visitLogMapper.selectCount(null);
        long todayVisits = visitLogMapper.selectCount(
            new LambdaQueryWrapper<VisitLog>().eq(VisitLog::getVisitDate, today));
        long weekVisits = visitLogMapper.selectCount(
            new LambdaQueryWrapper<VisitLog>().ge(VisitLog::getVisitDate, weekAgo));

        // 独立访客
        List<VisitLog> todayLogs = visitLogMapper.selectList(
            new LambdaQueryWrapper<VisitLog>().eq(VisitLog::getVisitDate, today));
        long todayUV = todayLogs.stream().map(VisitLog::getUserId).filter(Objects::nonNull).distinct().count();
        long todayIP = todayLogs.stream().map(VisitLog::getIp).filter(Objects::nonNull).distinct().count();

        data.put("totalVisits", totalVisits);
        data.put("todayVisits", todayVisits);
        data.put("weekVisits", weekVisits);
        data.put("todayUV", todayUV);
        data.put("todayIP", todayIP);

        // 近7日趋势
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long cnt = visitLogMapper.selectCount(
                new LambdaQueryWrapper<VisitLog>().eq(VisitLog::getVisitDate, d));
            trend.add(Map.of("date", d.toString(), "count", cnt,
                "dayOfWeek", List.of("周日","周一","周二","周三","周四","周五","周六").get(d.getDayOfWeek().getValue() % 7)));
        }
        data.put("trend", trend);

        // 页面访问排行
        List<Map<String, Object>> pageRank = new ArrayList<>();
        Map<String, Long> pageCounts = todayLogs.stream()
            .collect(Collectors.groupingBy(v -> v.getPageName() != null ? v.getPageName() : "未知",
                     Collectors.counting()));
        pageCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .forEach(e -> pageRank.add(Map.of("page", e.getKey(), "count", e.getValue())));
        data.put("pageRank", pageRank);

        // 时段分布 (0-23时)
        List<Map<String, Object>> hourlyDist = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            final int hour = h;
            long cnt = todayLogs.stream()
                .filter(v -> v.getCreatedAt() != null && v.getCreatedAt().getHour() == hour)
                .count();
            hourlyDist.add(Map.of("hour", String.format("%02d:00", h), "count", cnt));
        }
        data.put("hourlyDist", hourlyDist);

        // 平均停留时长
        Double avgDuration = todayLogs.stream()
            .filter(v -> v.getDurationSec() != null)
            .mapToInt(VisitLog::getDurationSec)
            .average()
            .orElse(0);
        data.put("avgDuration", Math.round(avgDuration));

        return data;
    }

    // 记录访问
    public void logVisit(String pagePath, String pageName, Long userId, String ip) {
        VisitLog log = new VisitLog();
        log.setPagePath(pagePath);
        log.setPageName(pageName);
        log.setUserId(userId);
        log.setIp(ip);
        log.setVisitDate(LocalDate.now());
        log.setCreatedAt(java.time.LocalDateTime.now());
        visitLogMapper.insert(log);
    }
}
