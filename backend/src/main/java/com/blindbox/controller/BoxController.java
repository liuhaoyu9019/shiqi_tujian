package com.blindbox.controller;

import com.blindbox.common.Result;
import com.blindbox.entity.BoxSeries;
import com.blindbox.entity.ItemDef;
import com.blindbox.service.BoxService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/box")
@RequiredArgsConstructor
public class BoxController {

    private final BoxService boxService;

    // 盲盒系列列表
    @GetMapping("/series")
    public Result<List<BoxSeries>> listSeries() {
        return Result.ok(boxService.listActiveSeries());
    }

    // 系列详情
    @GetMapping("/series/{id}")
    public Result<BoxSeries> getSeries(@PathVariable Long id) {
        return Result.ok(boxService.getSeriesById(id));
    }

    // 系列藏品列表（含概率）
    @GetMapping("/series/{id}/items")
    public Result<List<ItemDef>> listItems(@PathVariable Long id) {
        return Result.ok(boxService.listItemsBySeries(id));
    }
}
