package com.blindbox.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blindbox.entity.*;
import com.blindbox.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BoxSeriesMapper seriesMapper;
    private final ItemDefMapper itemDefMapper;

    // ===== Dashboard =====
    public Map<String, Object> dashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("seriesCount", seriesMapper.selectCount(null));
        data.put("itemCount", itemDefMapper.selectCount(null));
        // 各系列图片数量排行
        List<Map<String, Object>> seriesRank = new ArrayList<>();
        for (BoxSeries s : seriesMapper.selectList(null)) {
            long cnt = itemDefMapper.selectCount(
                new LambdaQueryWrapper<ItemDef>().eq(ItemDef::getSeriesId, s.getId())
            );
            seriesRank.add(Map.of("id", s.getId(), "name", s.getName(), "count", cnt));
        }
        seriesRank.sort((a, b) -> Long.compare((long) b.get("count"), (long) a.get("count")));
        data.put("seriesRank", seriesRank);
        return data;
    }

    // ===== 系列管理 =====
    public BoxSeries createSeries(BoxSeries series) {
        seriesMapper.insert(series);
        return series;
    }

    public BoxSeries updateSeries(BoxSeries series) {
        seriesMapper.updateById(series);
        return series;
    }

    public void deleteSeries(Long id) {
        BoxSeries existing = seriesMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("系列不存在");
        }
        BoxSeries s = new BoxSeries();
        s.setId(id);
        s.setStatus(0);
        seriesMapper.updateById(s);
    }

    // ===== 藏品管理 =====
    public ItemDef createItem(ItemDef item) {
        itemDefMapper.insert(item);
        return item;
    }

    public ItemDef updateItem(ItemDef item) {
        itemDefMapper.updateById(item);
        return item;
    }

    public void deleteItem(Long id) {
        ItemDef existing = itemDefMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("藏品不存在");
        }
        ItemDef item = new ItemDef();
        item.setId(id);
        item.setStatus(0);
        itemDefMapper.updateById(item);
    }

    // 藏品分页列表
    public Page<ItemDef> listItems(Long seriesId, int page, int size) {
        Page<ItemDef> pg = new Page<>(page, size);
        return itemDefMapper.selectPage(pg,
            new LambdaQueryWrapper<ItemDef>()
                .eq(seriesId != null, ItemDef::getSeriesId, seriesId)
                .orderByAsc(ItemDef::getSortOrder)
        );
    }

}
