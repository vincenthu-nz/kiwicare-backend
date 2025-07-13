import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() invoiceData: Partial<Invoice>): Promise<Invoice> {
    return await this.invoicesService.create(invoiceData);
  }

  @Get()
  async findAll(): Promise<Invoice[]> {
    return await this.invoicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Invoice> {
    return await this.invoicesService.findOne(id);
  }
}
