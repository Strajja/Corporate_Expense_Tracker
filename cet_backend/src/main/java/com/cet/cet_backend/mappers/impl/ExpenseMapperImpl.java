package com.cet.cet_backend.mappers.impl;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.mappers.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapperImpl implements Mapper<ExpenseEntity, ExpenseDto> {

    private final ModelMapper modelMapper;

    public ExpenseMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public ExpenseDto mapTo(ExpenseEntity expenseEntity) {
        return modelMapper.map(expenseEntity, ExpenseDto.class);
    }

    @Override
    public ExpenseEntity mapFrom(ExpenseDto expenseDto) {
        return modelMapper.map(expenseDto, ExpenseEntity.class);
    }
}
