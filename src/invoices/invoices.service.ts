import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async create(invoice: Partial<Invoice>): Promise<Invoice> {
    const newInvoice = this.invoiceRepo.create(invoice);
    return await this.invoiceRepo.save(newInvoice);
  }

  async findAll(): Promise<Invoice[]> {
    return await this.invoiceRepo.find();
  }

  async findOne(id: string): Promise<Invoice> {
    return await this.invoiceRepo.findOneBy({ id });
  }
}
