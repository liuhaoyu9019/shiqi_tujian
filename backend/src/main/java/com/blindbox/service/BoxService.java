package com.blindbox.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blindbox.entity.BoxSeries;
import com.blindbox.entity.ItemDef;
import com.blindbox.mapper.BoxSeriesMapper;
import com.blindbox.mapper.ItemDefMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoxService {

    private final BoxSeriesMapper boxSeriesMapper;
    private final ItemDefMapper itemDefMapper;

    // 获取在售盲盒系列
    public List<BoxSeries> listActiveSeries() {
        return boxSeriesMapper.selectList(
            new LambdaQueryWrapper<BoxSeries>()
                .eq(BoxSeries::getStatus, 1)
                .orderByDesc(BoxSeries::getSortOrder)
        );
    }

    // 获取系列详情
    public BoxSeries getSeriesById(Long id) {
        return boxSeriesMapper.selectById(id);
    }

    // 获取系列下所有藏品（含概率）
    public List<ItemDef> listItemsBySeries(Long seriesId) {
        return itemDefMapper.selectList(
            new LambdaQueryWrapper<ItemDef>()
                .eq(ItemDef::getSeriesId, seriesId)
                .eq(ItemDef::getStatus, 1)
        );
    }
}
