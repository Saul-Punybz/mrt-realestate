import { useState, useMemo } from 'react';
import { Calculator, DollarSign, Percent, Calendar, PieChart } from 'lucide-react';

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(1.2);
  const [insurance, setInsurance] = useState(1200);
  const [hoa, setHoa] = useState(0);

  // Sync down payment amount and percentage
  const handleHomePriceChange = (value: number) => {
    setHomePrice(value);
    setDownPayment(Math.round(value * (downPaymentPercent / 100)));
  };

  const handleDownPaymentChange = (value: number) => {
    setDownPayment(value);
    setDownPaymentPercent(Math.round((value / homePrice) * 100));
  };

  const handleDownPaymentPercentChange = (value: number) => {
    setDownPaymentPercent(value);
    setDownPayment(Math.round(homePrice * (value / 100)));
  };

  // Calculate mortgage details
  const calculations = useMemo(() => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Monthly principal & interest (P&I)
    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPI = principal / numberOfPayments;
    }

    // Monthly property tax
    const monthlyPropertyTax = (homePrice * (propertyTax / 100)) / 12;

    // Monthly insurance
    const monthlyInsurance = insurance / 12;

    // Total monthly payment
    const totalMonthly = monthlyPI + monthlyPropertyTax + monthlyInsurance + hoa;

    // Total cost over loan term
    const totalCost = totalMonthly * numberOfPayments;
    const totalInterest = monthlyPI * numberOfPayments - principal;

    return {
      principal,
      monthlyPI,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyHOA: hoa,
      totalMonthly,
      totalCost,
      totalInterest,
      loanAmount: principal,
    };
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTax, insurance, hoa]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Pie chart segments
  const pieData = [
    { label: 'Principal & Interés', value: calculations.monthlyPI, color: '#0A1628' },
    { label: 'Impuestos', value: calculations.monthlyPropertyTax, color: '#D4AF37' },
    { label: 'Seguro', value: calculations.monthlyInsurance, color: '#6B7280' },
    { label: 'HOA', value: calculations.monthlyHOA, color: '#9CA3AF' },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center">
            <Calculator className="w-6 h-6 text-navy-900" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-white">Calculadora de Hipoteca</h2>
            <p className="text-white/70 text-sm">Estima tu pago mensual</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            {/* Home Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Precio de la Propiedad
              </label>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="10000"
                value={homePrice}
                onChange={(e) => handleHomePriceChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">$100K</span>
                <input
                  type="text"
                  value={formatCurrency(homePrice)}
                  onChange={(e) => {
                    const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                    if (!isNaN(value)) handleHomePriceChange(value);
                  }}
                  className="text-center font-semibold text-navy-900 border-b border-gold-500 focus:outline-none w-32"
                />
                <span className="text-sm text-gray-500">$5M</span>
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Percent className="w-4 h-4" />
                Pago Inicial
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={formatCurrency(downPayment)}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                      if (!isNaN(value)) handleDownPaymentChange(value);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={downPaymentPercent}
                    onChange={(e) => handleDownPaymentPercentChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Percent className="w-4 h-4" />
                Tasa de Interés Anual
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">1%</span>
                <span className="font-semibold text-navy-900">{interestRate.toFixed(3)}%</span>
                <span className="text-sm text-gray-500">15%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Plazo del Préstamo
              </label>
              <div className="flex gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTerm(term)}
                    className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
                      loanTerm === term
                        ? 'bg-gold-500 border-gold-500 text-navy-900'
                        : 'border-gray-200 hover:border-gold-500'
                    }`}
                  >
                    {term} años
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Costs */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impuesto (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seguro/año
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HOA/mes
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={hoa}
                  onChange={(e) => setHoa(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {/* Monthly Payment */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-6 text-center mb-6">
              <p className="text-white/70 text-sm mb-2">Pago Mensual Estimado</p>
              <div className="font-serif text-4xl md:text-5xl text-gold-500 font-bold">
                {formatCurrency(calculations.totalMonthly)}
              </div>
              <p className="text-white/50 text-xs mt-2">
                Préstamo: {formatCurrency(calculations.loanAmount)}
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Desglose del Pago
              </h3>
              <div className="space-y-3">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="font-medium text-navy-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Summary */}
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Monto del Préstamo</span>
                <span className="font-semibold text-navy-900">
                  {formatCurrency(calculations.loanAmount)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Total de Intereses</span>
                <span className="font-semibold text-navy-900">
                  {formatCurrency(calculations.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Costo Total ({loanTerm} años)</span>
                <span className="font-semibold text-gold-600">
                  {formatCurrency(calculations.totalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
