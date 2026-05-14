import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  DollarSign
} from "lucide-react";
import { z } from "zod";

// Define interfaces for better type safety
interface Analytics {
  totalSales: string;
  totalOrders: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    userId: string;
    total: string;
    status: string;
    createdAt: string;
    items?: any[];
  }>;
  popularProducts: any[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string | null;
  imageUrl: string;
  categoryId?: string | null;
  stock?: number | null;
  rating?: string | null;
  reviewCount?: number | null;
  tags?: string[] | null;
  features?: any | null;
  isActive: boolean;
  createdAt: string;
}

const productFormSchema = insertProductSchema.extend({
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function Admin() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  }) as { data: Analytics | undefined };

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  }) as { data: Product[] };

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  }) as { data: Category[] };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      stock: 0,
      tags: "",
      isActive: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsAddProductOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    const productData = {
      ...values,
      tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      ...product,
      tags: product.tags?.join(", ") || "",
    });
    setIsAddProductOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      stock: 0,
      tags: "",
      isActive: true,
    });
  };

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <div className="min-h-screen bg-neutral-50">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-neutral-800 text-white min-h-screen">
          <div className="p-6 border-b border-neutral-700">
            <h3 className="text-lg font-semibold">Admin Panel</h3>
          </div>
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center w-full px-3 py-2 rounded text-left ${
                  activeTab === "analytics" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-700"
                }`}
                data-testid="tab-analytics"
              >
                <BarChart3 className="mr-3 w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center w-full px-3 py-2 rounded text-left ${
                  activeTab === "products" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-700"
                }`}
                data-testid="tab-products"
              >
                <Package className="mr-3 w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center w-full px-3 py-2 rounded text-left ${
                  activeTab === "orders" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-700"
                }`}
                data-testid="tab-orders"
              >
                <ShoppingCart className="mr-3 w-4 h-4" />
                Orders
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-neutral-600">Total Sales</p>
                          <p className="text-2xl font-bold text-primary" data-testid="text-total-sales">
                            ${analytics?.totalSales || "0.00"}
                          </p>
                          <p className="text-xs text-secondary">+12% this month</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-neutral-600">Orders</p>
                          <p className="text-2xl font-bold text-primary" data-testid="text-total-orders">
                            {analytics?.totalOrders || 0}
                          </p>
                          <p className="text-xs text-secondary">+8% this month</p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-neutral-600">Products</p>
                          <p className="text-2xl font-bold text-primary" data-testid="text-total-products">
                            {analytics?.totalProducts || 0}
                          </p>
                          <p className="text-xs text-secondary">Active inventory</p>
                        </div>
                        <Package className="w-8 h-8 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-neutral-600">AI Accuracy</p>
                          <p className="text-2xl font-bold text-accent">94.2%</p>
                          <p className="text-xs text-secondary">Recommendation score</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-accent opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics?.recentOrders?.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>{order.userId}</TableCell>
                            <TableCell>${order.total}</TableCell>
                            <TableCell>
                              <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-neutral-500">
                              No orders found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Products</h2>
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm} data-testid="button-add-product">
                        <Plus className="mr-2 w-4 h-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Product name" {...field} data-testid="input-product-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Product description" {...field} data-testid="input-product-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-product-price" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || 0}
                                      onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                      data-testid="input-product-stock" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-product-category">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category: Category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-product-image" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tags (comma separated)</FormLabel>
                                <FormControl>
                                  <Input placeholder="wireless, bluetooth, premium" {...field} data-testid="input-product-tags" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsAddProductOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={createProductMutation.isPending || updateProductMutation.isPending}
                              data-testid="button-save-product"
                            >
                              {createProductMutation.isPending || updateProductMutation.isPending 
                                ? "Saving..." 
                                : editingProduct ? "Update" : "Create"
                              }
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product: Product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>${product.price}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEdit(product)}
                                  data-testid={`button-edit-${product.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDelete(product.id)}
                                  data-testid={`button-delete-${product.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Orders</h2>
                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics?.recentOrders?.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>{order.userId}</TableCell>
                            <TableCell>{order.items?.length || 0} items</TableCell>
                            <TableCell>${order.total}</TableCell>
                            <TableCell>
                              <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-neutral-500">
                              No orders found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
