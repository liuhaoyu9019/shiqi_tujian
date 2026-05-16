package com.blindbox.controller;

import com.blindbox.common.Result;
import com.blindbox.entity.DrawRecord;
import com.blindbox.service.BoxService;
import com.blindbox.service.DrawService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/draw")
@RequiredArgsConstructor
public class DrawController {

    private final DrawService drawService;
    private final BoxService boxService;

    // 执行抽盒
    @PostMapping("/open")
    public Result<DrawRecord> openBox(
            @RequestHeader("X-User-Id") @NotNull Long userId,
            @RequestParam @NotNull Long seriesId) {
        // 从服务端获取实际价格，防止客户端篡改price参数
        var series = boxService.getSeriesById(seriesId);
        if (series == null || series.getStatus() != 1) {
            return Result.fail(400, "系列不存在或已下架");
        }
        Long actualPrice = series.getPrice();
        DrawRecord record = drawService.executeDraw(userId, seriesId, actualPrice);
        return Result.ok(record);
    }
}
