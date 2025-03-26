import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'MXN' | 'INR' | 'BRL' | 'RUB' | 'KRW' | 'SGD' | 'NZD' | 'THB';
type ExchangeRates = Record<CurrencyCode, number>;

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [SharedModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  currencyForm: FormGroup;
  result: number | null = null;
  isLoading = false;
  error: string | null = null;

  currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' }
  ];

  exchangeRates: ExchangeRates = {
    USD: 1.0,
    EUR: 0.93,
    GBP: 0.79,
    JPY: 144.80,
    AUD: 1.52,
    CAD: 1.38,
    CHF: 0.89,
    CNY: 7.19,
    MXN: 17.60,
    INR: 83.20,
    BRL: 5.62,
    RUB: 92.30,
    KRW: 1344.20,
    SGD: 1.35,
    NZD: 1.65,
    THB: 36.45
  };

  recentConversions: Array<{
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    result: number;
    date: Date;
  }> = [];

  constructor(private fb: FormBuilder) {
    this.currencyForm = this.fb.group({
      amount: [1, [Validators.required, Validators.min(0.01)]],
      fromCurrency: ['USD', Validators.required],
      toCurrency: ['EUR', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load recent conversions from localStorage in a real app
    this.loadSavedConversions();
  }

  loadSavedConversions(): void {
    // For demo purposes, populate with sample data
    this.recentConversions = [
      {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 1000,
        result: 930,
        date: new Date(Date.now() - 86400000)
      },
      {
        fromCurrency: 'EUR',
        toCurrency: 'JPY',
        amount: 500,
        result: 77957,
        date: new Date(Date.now() - 172800000)
      },
      {
        fromCurrency: 'GBP',
        toCurrency: 'USD',
        amount: 200,
        result: 253.16,
        date: new Date(Date.now() - 259200000)
      }
    ];
  }

  convertCurrency(): void {
    if (this.currencyForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const amount = this.currencyForm.value.amount;
    const fromCurrency = this.currencyForm.value.fromCurrency;
    const toCurrency = this.currencyForm.value.toCurrency;

    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, this would be an API call to a currency conversion service
        const fromRate = this.exchangeRates[fromCurrency as keyof typeof this.exchangeRates];
        const toRate = this.exchangeRates[toCurrency as keyof typeof this.exchangeRates];

        // Convert to USD first, then to target currency
        const amountInUSD = amount / fromRate;
        const amountInTargetCurrency = amountInUSD * toRate;

        this.result = parseFloat(amountInTargetCurrency.toFixed(2));

        // Add to recent conversions
        this.recentConversions.unshift({
          fromCurrency,
          toCurrency,
          amount,
          result: this.result,
          date: new Date()
        });

        // Keep only the 5 most recent conversions
        if (this.recentConversions.length > 5) {
          this.recentConversions.pop();
        }

        // In a real app, save to localStorage or backend
        this.isLoading = false;
      } catch (err) {
        this.error = 'An error occurred during conversion. Please try again.';
        this.isLoading = false;
      }
    }, 800); // Simulate network delay
  }

  swapCurrencies(): void {
    const fromCurrency = this.currencyForm.get('fromCurrency')?.value;
    const toCurrency = this.currencyForm.get('toCurrency')?.value;

    this.currencyForm.patchValue({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency
    });

    // Recalculate if there's already a result
    if (this.result) {
      this.convertCurrency();
    }
  }

  getCurrencySymbol(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency ? currency.symbol : '';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  clearHistory(): void {
    this.recentConversions = [];
    // In a real app, also clear from localStorage or backend
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    return this.exchangeRates[toCurrency as CurrencyCode] / this.exchangeRates[fromCurrency as CurrencyCode];
  }
}
