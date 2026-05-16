package com.blindbox.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blindbox.common.Result;
import com.blindbox.entity.*;
import com.blindbox.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ===== Dashboard =====
    @GetMapping("/dashboard")
    public Result<Map<String, Object>> dashboard() {
        return Result.ok(adminService.dashboard());
    }

    // ===== 系列管理 =====
    @PostMapping("/series")
    public Result<BoxSeries> createSeries(@RequestBody BoxSeries series) {
        return Result.ok(adminService.createSeries(series));
    }

    @PutMapping("/series/{id}")
    public Result<BoxSeries> updateSeries(@PathVariable Long id, @RequestBody BoxSeries series) {
        series.setId(id);
        return Result.ok(adminService.updateSeries(series));
    }

    @DeleteMapping("/series/{id}")
    public Result<Void> deleteSeries(@PathVariable Long id) {
        adminService.deleteSeries(id);
        return Result.ok(null);
    }

    // ===== 藏品管理 =====
    @GetMapping("/items")
    public Result<Page<ItemDef>> listItems(
            @RequestParam(required = false) Long seriesId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(adminService.listItems(seriesId, page, size));
    }

    @PostMapping("/items")
    public Result<ItemDef> createItem(@RequestBody ItemDef item) {
        return Result.ok(adminService.createItem(item));
    }

    @PutMapping("/items/{id}")
    public Result<ItemDef> updateItem(@PathVariable Long id, @RequestBody ItemDef item) {
        item.setId(id);
        return Result.ok(adminService.updateItem(item));
    }

    @DeleteMapping("/items/{id}")
    public Result<Void> deleteItem(@PathVariable Long id) {
        adminService.deleteItem(id);
        return Result.ok(null);
    }

}
