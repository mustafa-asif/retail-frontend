import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { toast } from 'sonner';
import { format } from 'date-fns';
import api from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';

const saleFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  storeId: z.string().min(1, 'Store is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    qty: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

export default function NewSalePage() {
  const { storeId, isAdmin, branch } = useBranchFilter();
  const navigate = useNavigate();
  const [successData, setSuccessData] = useState<any | null>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.getAll().then(res => "data" in res ? res.data : []),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.products.getAll(),
  });

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: '',
      storeId: storeId ? storeId.toString() : '',
      paymentMethod: 'Cash',
      items: [{ productId: '', qty: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const processSale = useMutation({
    mutationFn: (data: any) => api.sales.process(data),
    onSuccess: (data) => {
      toast.success('Sale recorded! Inventory and audit updated by database triggers.');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      setSuccessData(data || { id: Math.floor(Math.random() * 1000) }); // Fallback ID if mock API returns empty
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process sale');
    }
  });

  const onSubmit = (values: SaleFormValues) => {
    // Transform to DTO
    const dto = {
      customerId: parseInt(values.customerId),
      storeId: parseInt(values.storeId),
      paymentMethod: values.paymentMethod,
      items: values.items.map(item => ({
        productId: parseInt(item.productId),
        qty: item.qty
      }))
    };
    processSale.mutate(dto);
  };

  // Watch form values for live preview calculation
  const watchItems = form.watch('items');
  const watchCustomerId = form.watch('customerId');
  const watchPaymentMethod = form.watch('paymentMethod');

  const invoiceData = useMemo(() => {
    const customer = customers.find((c: any) => c.id.toString() === watchCustomerId);
    
    const mappedItems = watchItems.map(item => {
      const product = products.find((p: any) => p.id.toString() === item.productId);
      const price = product?.price || 0;
      return {
        name: product?.name || 'Select Product',
        qty: item.qty || 0,
        price,
        total: price * (item.qty || 0)
      };
    }).filter(i => i.name !== 'Select Product');

    const total = mappedItems.reduce((acc, curr) => acc + curr.total, 0);

    return {
      saleId: successData?.id || 'DRAFT',
      date: format(new Date(), 'PPpp'),
      storeName: branch || 'Gulshan', // fallback
      customerName: customer?.name || 'Walk-in Customer',
      customerContact: customer?.email || '',
      items: mappedItems,
      subtotal: total,
      tax: 0,
      total,
      paymentMethod: watchPaymentMethod || 'Cash'
    };
  }, [watchItems, watchCustomerId, watchPaymentMethod, customers, products, branch, successData]);

  if (successData) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <Card className="text-center p-8 border-green-200 bg-green-50/30">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sale Complete!</h2>
          <p className="text-slate-600 mb-8">System triggers have automatically updated inventory stock levels and audit logs.</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setSuccessData(null)} variant="outline">New Sale</Button>
            <Button onClick={() => navigate('/sales')} className="bg-blue-600 hover:bg-blue-700">View All Sales</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 overflow-y-auto pr-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle>Process New Sale</CardTitle>
            <CardDescription>Enter details to process transaction.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Controller
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Store Branch</Label>
                  <Controller
                    control={form.control}
                    name="storeId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Gulshan</SelectItem>
                          <SelectItem value="2">Defense</SelectItem>
                          <SelectItem value="3">Awami</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Line Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', qty: 1 })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Product</Label>
                      <Controller
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p: any) => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name} - PKR {p.price}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-xs">Qty</Label>
                      <Controller
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field }) => (
                          <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="bg-white" />
                        )}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="w-1/2 space-y-2">
                <Label>Payment Method</Label>
                <Controller
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={processSale.isPending}>
                {processSale.isPending ? 'Processing...' : 'Complete Sale & Generate Invoice'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Panel */}
      <div className="hidden lg:block w-5/12 xl:w-1/2 h-[calc(100vh-8rem)]">
        <InvoicePreview data={invoiceData} />
      </div>
    </div>
  );
}
