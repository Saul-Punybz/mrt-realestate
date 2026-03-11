import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Building, Percent } from 'lucide-react';

export default function ROICalculator() {
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [closingCosts, setClosingCosts] = useState(12000);
  const [repairs, setRepairs] = useState(15000);
  const [monthlyRent, setMonthlyRent] = useState(2800);
  const [vacancy, setVacancy] = useState(5);
  const [propertyManagement, setPropertyManagement] = useState(10);
  const [monthlyExpenses, setMonthlyExpenses] = useState(800);
  const [mortgagePayment, setMortgagePayment] = useState(2100);
  const [appreciation, setAppreciation] = useState(3);
  const [holdingPeriod, setHoldingPeriod] = useState(5);

  const calculations = useMemo(() => {
    // Total cash invested
    const totalInvestment = downPayment + closingCosts + repairs;

    // Annual gross rental income
    const annualGrossRent = monthlyRent * 12;

    // Effective rental income (accounting for vacancy)
    const effectiveRent = annualGrossRent * (1 - vacancy / 100);

    // Annual expenses
    const annualManagement = effectiveRent * (propertyManagement / 100);
    const annualExpenses = monthlyExpenses * 12;
    const annualMortgage = mortgagePayment * 12;
    const totalAnnualExpenses = annualManagement + annualExpenses + annualMortgage;

    // Net Operating Income (NOI) - before mortgage
    const noi = effectiveRent - annualExpenses - annualManagement;

    // Annual cash flow (after mortgage)
    const annualCashFlow = effectiveRent - totalAnnualExpenses;
    const monthlyCashFlow = annualCashFlow / 12;

    // Cap Rate
    const capRate = (noi / purchasePrice) * 100;

    // Cash-on-Cash Return
    const cashOnCash = (annualCashFlow / totalInvestment) * 100;

    // Future property value
    const futureValue = purchasePrice * Math.pow(1 + appreciation / 100, holdingPeriod);
    const equityGain = futureValue - purchasePrice;

    // Total return over holding period
    const totalCashFlow = annualCashFlow * holdingPeriod;
    const totalReturn = totalCashFlow + equityGain;
    const totalROI = (totalReturn / totalInvestment) * 100;
    const annualizedROI = (Math.pow(1 + totalReturn / totalInvestment, 1 / holdingPeriod) - 1) * 100;

    // GRM (Gross Rent Multiplier)
    const grm = purchasePrice / annualGrossRent;

    // 1% Rule
    const onePercentRule = (monthlyRent / purchasePrice) * 100;

    return {
      totalInvestment,
      annualGrossRent,
      effectiveRent,
      noi,
      annualCashFlow,
      monthlyCashFlow,
      capRate,
      cashOnCash,
      futureValue,
      equityGain,
      totalCashFlow,
      totalReturn,
      totalROI,
      annualizedROI,
      grm,
      onePercentRule,
    };
  }, [
    purchasePrice,
    downPayment,
    closingCosts,
    repairs,
    monthlyRent,
    vacancy,
    propertyManagement,
    monthlyExpenses,
    mortgagePayment,
    appreciation,
    holdingPeriod,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; great: number }) => {
    if (value >= thresholds.great) return 'text-green-600';
    if (value >= thresholds.good) return 'text-gold-600';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-navy-900" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-white">Calculadora de ROI</h2>
            <p className="text-white/70 text-sm">Analiza el retorno de tu inversión</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            {/* Purchase Details */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Detalles de Compra
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Precio de Compra</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pago Inicial</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Costos de Cierre</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={closingCosts}
                      onChange={(e) => setClosingCosts(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Reparaciones</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={repairs}
                      onChange={(e) => setRepairs(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Income */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Ingresos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Renta Mensual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Vacancia (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={vacancy}
                    onChange={(e) => setVacancy(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Gastos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Hipoteca/mes</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={mortgagePayment}
                      onChange={(e) => setMortgagePayment(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Otros Gastos/mes</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Administración de Propiedad (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={propertyManagement}
                    onChange={(e) => setPropertyManagement(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0%</span>
                    <span className="font-medium text-navy-900">{propertyManagement}%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appreciation */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-4">Proyección</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Apreciación Anual (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={appreciation}
                    onChange={(e) => setAppreciation(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Período (años)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={holdingPeriod}
                    onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-4 text-center">
                <p className="text-white/70 text-xs mb-1">Cash-on-Cash</p>
                <div
                  className={`font-serif text-2xl font-bold ${getPerformanceColor(
                    calculations.cashOnCash,
                    { good: 6, great: 10 }
                  )}`}
                >
                  {calculations.cashOnCash.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-4 text-center">
                <p className="text-white/70 text-xs mb-1">Cap Rate</p>
                <div
                  className={`font-serif text-2xl font-bold ${getPerformanceColor(
                    calculations.capRate,
                    { good: 5, great: 8 }
                  )}`}
                >
                  {calculations.capRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl p-4 text-center">
                <p className="text-navy-900/70 text-xs mb-1">Flujo de Caja/mes</p>
                <div
                  className={`font-serif text-2xl font-bold ${
                    calculations.monthlyCashFlow >= 0 ? 'text-navy-900' : 'text-red-700'
                  }`}
                >
                  {formatCurrency(calculations.monthlyCashFlow)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl p-4 text-center">
                <p className="text-navy-900/70 text-xs mb-1">ROI Total ({holdingPeriod} años)</p>
                <div className="font-serif text-2xl font-bold text-navy-900">
                  {calculations.totalROI.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-navy-900 mb-4">Resumen de Inversión</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Inversión Total</span>
                  <span className="font-medium">{formatCurrency(calculations.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Renta Bruta Anual</span>
                  <span className="font-medium">{formatCurrency(calculations.annualGrossRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NOI (Ingreso Neto)</span>
                  <span className="font-medium">{formatCurrency(calculations.noi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flujo de Caja Anual</span>
                  <span
                    className={`font-medium ${
                      calculations.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(calculations.annualCashFlow)}
                  </span>
                </div>
              </div>
            </div>

            {/* Projection */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-navy-900 mb-4">
                Proyección a {holdingPeriod} Años
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Futuro</span>
                  <span className="font-medium">{formatCurrency(calculations.futureValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ganancia por Apreciación</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(calculations.equityGain)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flujo de Caja Total</span>
                  <span className="font-medium">{formatCurrency(calculations.totalCashFlow)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-900 font-semibold">Retorno Total</span>
                  <span className="font-bold text-gold-600">
                    {formatCurrency(calculations.totalReturn)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">GRM</p>
                <p className="font-semibold text-navy-900">{calculations.grm.toFixed(1)}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Regla del 1%</p>
                <p
                  className={`font-semibold ${
                    calculations.onePercentRule >= 1 ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  {calculations.onePercentRule.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
