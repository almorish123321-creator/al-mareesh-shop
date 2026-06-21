'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore, type View } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  Search, ShoppingCart, User, Menu, X, Heart, Star, ChevronLeft, ChevronRight,
  Truck, Shield, RotateCcw, Headphones, Plus, Minus, Trash2, ArrowLeft,
  Package, ShoppingBag, Users, DollarSign, TrendingUp, Settings, Tags,
  BarChart3, Eye, Edit, Store, Grid3X3, Phone, Mail, MapPin,
  Facebook, Twitter, Instagram, Youtube, Check, AlertCircle, ChevronDown,
  Clock, CreditCard, Banknote, Wallet, Gift, Sparkles, Crown, Baby,
  Shirt, Footprints, Zap, ArrowRight, Copy, Share2, MessageCircle, Send,
  Tag, Percent, Box, ClipboardList, LayoutDashboard, Archive, Receipt,
  CircleDot, UserCircle, CalendarDays, MapPinned, PhoneCall, Notebook,
  Smartphone
} from 'lucide-react';

/* ─── TYPES ─── */
interface CategoryType {
  id: string; name: string; nameEn: string; slug: string; description?: string;
  image?: string; icon?: string; parentId?: string; sortOrder: number;
  _count?: { products: number };
}

interface ProductType {
  id: string; name: string; nameEn: string; slug: string; description: string;
  price: number; comparePrice?: number; sku: string; stock: number;
  images: string; categoryId: string; brand?: string; sizes?: string;
  colors?: string; material?: string; tags?: string; isFeatured: boolean;
  isNew: boolean; isBestseller: boolean; isActive: boolean; avgRating: number;
  reviewCount: number; totalSold: number; createdAt: string;
  category?: CategoryType;
}

interface SliderType {
  id: string; title: string; titleEn?: string; subtitle?: string;
  subtitleEn?: string; image: string; link?: string; sortOrder: number;
}

interface BundleType {
  id: string; name: string; description?: string; image?: string;
  discount: number; products: BundleProductType[];
}

interface BundleProductType {
  productId: string; name: string; price: number; image: string; quantity: number;
}

interface CartItemType {
  id?: string; productId: string; name: string; price: number;
  image: string; quantity: number; size?: string; color?: string;
  stock: number; maxStock: number;
}

interface OrderType {
  id: string; orderNumber: string; status: string; paymentMethod: string;
  paymentStatus: string; subtotal: number; shippingCost: number;
  discount: number; total: number; shippingName: string; shippingPhone: string;
  shippingAddress: string; shippingCity: string; shippingCountry: string;
  createdAt: string; items: OrderItemType[]; user?: { name: string; email: string };
}

interface OrderItemType {
  id: string; productId: string; name: string; price: number;
  quantity: number; size?: string; color?: string; total: number;
}

interface SettingsType {
  store_name?: string; store_email?: string; store_phone?: string;
  shipping_cost?: string; free_shipping_threshold?: string;
}

/* ─── HELPERS ─── */
const safeJsonParse = (str: string | null | undefined, fallback: any = []) => {
  try {
    if (!str || str.trim() === '') return fallback;
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const formatPrice = (price: number) => {
  return price.toLocaleString('ar-YE') + ' ر.ي';
};

const calcDiscount = (price: number, compare?: number) => {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
};

const statusMap: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  processing: 'bg-sky-100 text-sky-800 border border-sky-200',
  shipped: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  delivered: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
};

/* ─── STAR RATING ─── */
function StarRating({ rating, size = 16, onChange }: { rating: number; size?: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={`cursor-${onChange ? 'pointer' : 'default'} ${s <= rating ? 'fill-gold text-gold' : 'text-gray-300'}`}
          onClick={() => onChange?.(s)}
        />
      ))}
    </div>
  );
}

/* ─── NOTIFICATION TOAST ─── */
// تم نقله داخل المكون الرئيسي لتجنب خطأ React #310

/* ─── MAIN APP ─── */
export default function Home() {
  const store = useAppStore();
  const {
    view, setView, selectedProductId, setSelectedProduct, selectedCategory,
    setSelectedCategory, searchQuery, setSearchQuery, user, setUser, cart,
    setCart, cartCount, adminTab, setAdminTab, showAuthModal, setShowAuthModal,
    authMode, setAuthMode, showNotification,
    notification, clearNotification,
  } = store;

  /* ─── NOTIFICATION (inline to avoid React #310) ─── */
  useEffect(() => {
    if (notification) {
      const t = setTimeout(clearNotification, 3000);
      return () => clearTimeout(t);
    }
  }, [notification, clearNotification]);

  /* ─── LOCAL STATE ─── */
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [sliders, setSliders] = useState<SliderType[]>([]);
  const [settings, setSettings] = useState<SettingsType>({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [shopSort, setShopSort] = useState('newest');
  const [shopPage, setShopPage] = useState(1);
  const [shopPriceRange, setShopPriceRange] = useState<[number, number]>([0, 1000]);
  const [shopSelectedCategories, setShopSelectedCategories] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [adminOrderFilter, setAdminOrderFilter] = useState('all');
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [adminCoupons, setAdminCoupons] = useState<any[]>([]);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [adminCustomers, setAdminCustomers] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [productQty, setProductQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderType | null>(null);
  const [adminOrders, setAdminOrders] = useState<OrderType[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminProducts, setAdminProducts] = useState<ProductType[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<ProductType> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Partial<CategoryType> | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  /* ─── AUTH FORM STATE ─── */
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '' });

  /* ─── CHECKOUT FORM STATE ─── */
  const [checkoutForm, setCheckoutForm] = useState({
    name: '', phone: '', address: '', city: '', country: 'اليمن', postalCode: '', paymentMethod: 'karimi', notes: ''
  });

  /* ─── ADMIN SETTINGS FORM ─── */
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  /* ─── PRODUCT REVIEW STATE ─── */
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [productReviews, setProductReviews] = useState<any[]>([]);

  /* ─── WISHLIST ─── */
  const [wishlist, setWishlist] = useState<string[]>([]);

  /* ─── CART NOTES ─── */
  const [cartNotes, setCartNotes] = useState('');

  /* ─── CURRENCY ─── */
  const [currency, setCurrency] = useState<'YER' | 'USD'>('YER');
  const usdRate = 530; // 1 USD = 530 YER
  const formatPriceCurrency = (price: number) => {
    if (currency === 'USD') return '$' + (price / usdRate).toFixed(2);
    return price.toLocaleString('ar-YE') + ' ر.ي';
  };

  /* ─── BUNDLES ─── */
  const [bundles] = useState<BundleType[]>([
    {
      id: 'b1', name: 'باقة الأناقة النسائية', description: 'طقم كامل بخصم خاص', discount: 15,
      image: '',
      products: [
        { productId: '', name: 'عباية نسائية فاخرة', price: 8000, image: '', quantity: 1 },
        { productId: '', name: 'حجاب قطني مميز', price: 1500, image: '', quantity: 2 },
        { productId: '', name: 'حذاء نسائي أنيق', price: 5000, image: '', quantity: 1 },
      ]
    },
    {
      id: 'b2', name: 'باقة الطفل السعيد', description: 'كل ما يحتاجه طفلك بخصم مميز', discount: 10,
      image: '',
      products: [
        { productId: '', name: 'بجامة أطفال قطنية', price: 2500, image: '', quantity: 2 },
        { productId: '', name: 'حذاء أطفال مريح', price: 3000, image: '', quantity: 1 },
        { productId: '', name: 'شنطة مدرسية', price: 4500, image: '', quantity: 1 },
      ]
    },
    {
      id: 'b3', name: 'باقة الرجل العصري', description: 'إطلالة كاملة بأسعار لا تُقاوم', discount: 12,
      image: '',
      products: [
        { productId: '', name: 'قميص رجالي كلاسيك', price: 6000, image: '', quantity: 1 },
        { productId: '', name: 'بنطلون رجالي', price: 7000, image: '', quantity: 1 },
        { productId: '', name: 'حذاء رجالي جلد', price: 12000, image: '', quantity: 1 },
      ]
    },
  ]);

  /* ─── REQUEST PRODUCT ─── */
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', description: '', category: '', expectedPrice: '', link: '' });

  /* ─── AI CHAT ─── */
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: string; text: string}[]>([{role: 'bot', text: 'مرحباً! أنا مساعد المريش شوب الذكي. كيف أقدر أساعدك؟ 🛍️'}]);
  const [aiInput, setAiInput] = useState('');

  /* ─── ORDER TRACKING ─── */
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackResult, setTrackResult] = useState<OrderType | null>(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  /* ─── ADMIN ORDER DETAIL ─── */
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);

  /* ─── IMAGE UPLOAD ─── */
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  /* ─── DATA FETCHING ─── */
  const seedAndFetch = useCallback(async () => {
    try {
      setLoading(true);
      try { await fetch('/api/seed'); } catch { /* seed can fail silently */ }
      
      const [catRes, prodRes, sliderRes, settingsRes] = await Promise.all([
        fetch('/api/categories').catch(() => null),
        fetch('/api/products?limit=100').catch(() => null),
        fetch('/api/sliders').catch(() => null),
        fetch('/api/settings').catch(() => null),
      ]);
      
      let catData: any = [];
      let prodData: any = { products: [] };
      let sliderData: any = [];
      let settingsData: any = {};
      
      try { if (catRes?.ok) catData = await catRes.json(); } catch { /* ignore */ }
      try { if (prodRes?.ok) prodData = await prodRes.json(); } catch { /* ignore */ }
      try { if (sliderRes?.ok) sliderData = await sliderRes.json(); } catch { /* ignore */ }
      try { if (settingsRes?.ok) settingsData = await settingsRes.json(); } catch { /* ignore */ }
      
      setCategories(Array.isArray(catData) ? catData : []);
      setProducts(Array.isArray(prodData?.products) ? prodData.products : []);
      setSliders(Array.isArray(sliderData) ? sliderData : []);
      setSettings(settingsData && typeof settingsData === 'object' ? settingsData : {});
      setSettingsForm(settingsData && typeof settingsData === 'object' ? settingsData : {});
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { seedAndFetch(); }, [seedAndFetch]);

  /* ─── ADMIN DATA ─── */
  const fetchAdminData = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const [statsRes, ordersRes, couponsRes, customersRes] = await Promise.all([
        fetch('/api/admin/stats').catch(() => null),
        fetch('/api/orders').catch(() => null),
        fetch('/api/coupons/all').catch(() => null),
        fetch('/api/customers').catch(() => null),
      ]);
      try { if (statsRes?.ok) setAdminStats(await statsRes.json()); } catch { /* ignore */ }
      try { if (ordersRes?.ok) setAdminOrders(await ordersRes.json()); } catch { /* ignore */ }
      try { if (couponsRes?.ok) setAdminCoupons(await couponsRes.json()); } catch { /* ignore */ }
      try { if (customersRes?.ok) setAdminCustomers(await customersRes.json()); } catch { /* ignore */ }
      setAdminProducts(products);
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
  }, [user, products, adminRefreshKey]);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  /* ─── SCROLL HEADER ─── */
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── SLIDER AUTOPLAY ─── */
  useEffect(() => {
    if (view !== 'home' || sliders.length === 0) return;
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % sliders.length), 5000);
    return () => clearInterval(t);
  }, [view, sliders.length]);

  /* ─── AUTH HANDLERS ─── */
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });
      const data = await res.json();
      if (data.error) { showNotification(data.error, 'error'); return; }
      setUser(data);
      setShowAuthModal(false);
      if (data.role === 'admin') {
        setView('admin');
        setAdminTab('dashboard');
        showNotification('مرحباً بك في لوحة التحكم!', 'success');
      } else {
        showNotification('تم تسجيل الدخول بنجاح', 'success');
      }
    } catch { showNotification('خطأ في تسجيل الدخول', 'error'); }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (data.error) { showNotification(data.error, 'error'); return; }
      setUser(data);
      setShowAuthModal(false);
      showNotification('تم التسجيل بنجاح', 'success');
    } catch { showNotification('خطأ في التسجيل', 'error'); }
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setView('home');
    showNotification('تم تسجيل الخروج', 'info');
  };

  /* ─── CART HANDLERS ─── */
  const addToCart = (product: ProductType) => {
    if (!selectedSize && product.sizes) { showNotification('يرجى اختيار المقاس', 'error'); return; }
    if (!selectedColor && product.colors) { showNotification('يرجى اختيار اللون', 'error'); return; }
    const images = safeJsonParse(product.images);
    const existing = cart.find((c: CartItemType) =>
      c.productId === product.id && c.size === selectedSize && c.color === selectedColor
    );
    if (existing) {
      const updated = cart.map((c: CartItemType) =>
        c.productId === product.id && c.size === selectedSize && c.color === selectedColor
          ? { ...c, quantity: c.quantity + productQty } : c
      );
      setCart(updated);
    } else {
      const newItem: CartItemType = {
        productId: product.id, name: product.name, price: product.price,
        image: images[0] || '', quantity: productQty, size: selectedSize,
        color: selectedColor, stock: product.stock, maxStock: product.stock,
      };
      setCart([...cart, newItem]);
    }
    showNotification('تمت الإضافة للسلة', 'success');
    setSelectedSize(''); setSelectedColor(''); setProductQty(1);
  };

  const updateCartQty = (idx: number, qty: number) => {
    if (qty < 1) return;
    const item = cart[idx] as CartItemType;
    if (qty > item.maxStock) { showNotification('الكمية المطلوبة غير متوفرة', 'error'); return; }
    const updated = [...cart];
    updated[idx] = { ...updated[idx], quantity: qty };
    setCart(updated);
  };

  const removeCartItem = (idx: number) => {
    setCart(cart.filter((_: any, i: number) => i !== idx));
    showNotification('تم الحذف من السلة', 'info');
  };

  const cartSubtotal = cart.reduce((sum: number, c: CartItemType) => sum + c.price * c.quantity, 0);
  // تكلفة الشحن حسب المحافظة اليمنية
  const yemenCities: Record<string, number> = {
    'صنعاء': 0, 'عدن': 500, 'تعز': 400, 'الحديدة': 400, 'إب': 350,
    'ذمار': 300, 'المكلا': 600, 'حضرموت': 600, 'عمران': 200, 'صعدة': 350,
    'البيضاء': 350, 'مأرب': 400, 'لحج': 450, 'أبين': 500, 'شبوة': 500,
    'حجة': 300, 'المهرة': 700, 'ريمة': 350, 'سقطرى': 800, 'الضالع': 350,
    'الجوف': 350, 'صالح': 300, 'دمت': 300, 'السويدة': 350,
  };
  const getShippingCost = () => {
    if (cartSubtotal >= parseFloat(settings.free_shipping_threshold || '5000')) return 0;
    const baseCost = parseFloat(settings.shipping_cost || '500');
    const cityCost = yemenCities[checkoutForm.city] ?? baseCost;
    return cityCost;
  };
  const shippingCost = view === 'checkout' ? getShippingCost() : (cartSubtotal >= parseFloat(settings.free_shipping_threshold || '5000') ? 0 : parseFloat(settings.shipping_cost || '500'));
  const cartTax = Math.round(cartSubtotal * 0.02); // 2% tax
  const cartTotal = cartSubtotal + shippingCost - couponDiscount + cartTax;

  /* ─── COUPON ─── */
  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`/api/coupons?code=${couponCode}&subtotal=${cartSubtotal}`);
      const data = await res.json();
      if (data.error) { showNotification(data.error, 'error'); return; }
      setCouponDiscount(data.discount);
      showNotification(`تم تطبيق الخصم: ${formatPrice(data.discount)}`, 'success');
    } catch { showNotification('خطأ في تطبيق الكوبون', 'error'); }
  };

  /* ─── CHECKOUT ─── */
  const placeOrder = async () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.city) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error'); return;
    }
    try {
      const orderData = {
        userId: user?.id || 'guest',
        status: 'pending',
        paymentMethod: checkoutForm.paymentMethod,
        paymentStatus: 'unpaid',
        subtotal: cartSubtotal,
        shippingCost,
        discount: couponDiscount,
        total: cartTotal,
        shippingName: checkoutForm.name,
        shippingPhone: checkoutForm.phone,
        shippingAddress: checkoutForm.address,
        shippingCity: checkoutForm.city,
        shippingCountry: checkoutForm.country,
        shippingPostalCode: checkoutForm.postalCode,
        notes: checkoutForm.notes,
        couponCode: couponCode || undefined,
        items: cart.map((c: CartItemType) => ({
          productId: c.productId, name: c.name, price: c.price,
          quantity: c.quantity, size: c.size || undefined, color: c.color || undefined, total: c.price * c.quantity,
        })),
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const order = await res.json();
      if (order.error) {
        showNotification(order.error + (order.details ? ` (${order.details})` : ''), 'error');
        return;
      }
      setPlacedOrder(order);
      setOrderPlaced(true);
      setCart([]);
      setCouponDiscount(0);
      setCouponCode('');
      setAdminRefreshKey(k => k + 1);
      showNotification('تم تقديم الطلب بنجاح!', 'success');
      // إرسال إشعار واتساب تلقائي للأدمن بتفاصيل الطلب
      try {
        const itemsText = cart.map((c: CartItemType) => `• ${c.name} × ${c.quantity} = ${formatPrice(c.price * c.quantity)}`).join('\n');
        const paymentLabel = checkoutForm.paymentMethod === 'karimi' ? 'كريمي' : checkoutForm.paymentMethod === 'qutaibi' ? 'قطيبي' : checkoutForm.paymentMethod === 'jeeb' ? 'جيب' : 'عند الاستلام';
        const adminMsg = `🛒 *طلب جديد - المريش شوب*\n\n📋 رقم الطلب: ${order.orderNumber}\n👤 العميل: ${checkoutForm.name}\n📞 الهاتف: ${checkoutForm.phone}\n📍 العنوان: ${checkoutForm.address}, ${checkoutForm.city}\n\n📦 المنتجات:\n${itemsText}\n\n💰 الإجمالي: ${formatPrice(cartTotal)}\n💳 الدفع: ${paymentLabel}\n${checkoutForm.notes ? '📝 ملاحظات: ' + checkoutForm.notes : ''}`;
        window.open(`https://wa.me/967776792012?text=${encodeURIComponent(adminMsg)}`, '_blank');
      } catch { /* ignore whatsapp error */ }
    } catch { showNotification('خطأ في تقديم الطلب - يرجى المحاولة مرة أخرى', 'error'); }
  };

  /* ─── FILTERED PRODUCTS FOR SHOP ─── */
  const filteredProducts = products.filter((p) => {
    if (shopSelectedCategories.length > 0) {
      if (!shopSelectedCategories.includes(p.categoryId)) return false;
    }
    if (p.price < shopPriceRange[0] || p.price > shopPriceRange[1]) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.includes(q) && !p.nameEn.toLowerCase().includes(q) && !p.description.includes(q)) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (shopSort === 'price-low') return a.price - b.price;
    if (shopSort === 'price-high') return b.price - a.price;
    if (shopSort === 'bestseller') return b.totalSold - a.totalSold;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const productsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice((shopPage - 1) * productsPerPage, shopPage * productsPerPage);

  /* ─── CURRENT PRODUCT ─── */
  const currentProduct = products.find((p) => p.id === selectedProductId);

  /* ─── ADMIN PRODUCT CRUD ─── */
  const saveProduct = async () => {
    if (!editProduct) return;
    try {
      const method = editProduct.id ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      if (res.ok) {
        showNotification(editProduct.id ? 'تم تحديث المنتج' : 'تم إضافة المنتج', 'success');
        setShowProductModal(false);
        setEditProduct(null);
        seedAndFetch();
      }
    } catch { showNotification('خطأ في حفظ المنتج', 'error'); }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) { showNotification('تم حذف المنتج', 'success'); seedAndFetch(); }
    } catch { showNotification('خطأ في حذف المنتج', 'error'); }
  };

  /* ─── ADMIN CATEGORY CRUD ─── */
  const saveCategory = async () => {
    if (!editCategory) return;
    try {
      const method = editCategory.id ? 'PUT' : 'POST';
      const res = await fetch('/api/categories', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCategory),
      });
      if (res.ok) {
        showNotification(editCategory.id ? 'تم تحديث الفئة' : 'تم إضافة الفئة', 'success');
        setShowCategoryModal(false);
        setEditCategory(null);
        seedAndFetch();
      }
    } catch { showNotification('خطأ في حفظ الفئة', 'error'); }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) { showNotification('تم حذف الفئة', 'success'); seedAndFetch(); }
    } catch { showNotification('خطأ في حذف الفئة', 'error'); }
  };

  /* ─── ADMIN ORDER STATUS ─── */
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (res.ok) {
        showNotification('تم تحديث حالة الطلب', 'success');
        fetchAdminData();
      }
    } catch { showNotification('خطأ في تحديث الطلب', 'error'); }
  };

  /* ─── ADMIN SETTINGS SAVE ─── */
  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) { showNotification('تم حفظ الإعدادات', 'success'); seedAndFetch(); }
    } catch { showNotification('خطأ في حفظ الإعدادات', 'error'); }
  };

  /* ─── WISHLIST HANDLERS ─── */
  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      showNotification('تم الإزالة من المفضلة', 'info');
    } else {
      setWishlist([...wishlist, productId]);
      showNotification('تم الإضافة للمفضلة', 'success');
    }
  };

  /* ─── TRACK ORDER ─── */
  const handleTrackOrder = async () => {
    if (!trackOrderNumber) return;
    try {
      const res = await fetch(`/api/orders?number=${trackOrderNumber}`);
      if (res.ok) {
        const data = await res.json();
        setTrackResult(data);
      } else {
        showNotification('لم يتم العثور على الطلب', 'error');
      }
    } catch {
      showNotification('خطأ في البحث عن الطلب', 'error');
    }
  };

  /* ─── AI CHAT HANDLER ─── */
  const handleAiChat = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');
    // Simple AI responses
    setTimeout(() => {
      let reply = '';
      const q = userMsg.toLowerCase();
      if (q.includes('سعر') || q.includes('كم')) {
        reply = 'يمكنك الاطلاع على أسعار جميع المنتجات في صفحة المتجر. هل تريد البحث عن منتج معين؟';
      } else if (q.includes('شحن') || q.includes('توصيل')) {
        reply = `الشحن مجاني للطلبات فوق ${settings.free_shipping_threshold || '300'} ر.ي، وتكلفة الشحن العادي ${settings.shipping_cost || '25'} ر.ي. نوفر توصيل سريع لجميع المحافظات!`;
      } else if (q.includes('دفع') || q.includes('كريمي') || q.includes('جيب') || q.includes('قطيبي')) {
        reply = 'نقبل الدفع عبر: كريمي، قطيبي، جيب، وكذلك الدفع عند الاستلام. اختر الطريقة المناسبة لك عند الدفع!';
      } else if (q.includes('استرجاع') || q.includes('إرجاع') || q.includes('رجوع')) {
        reply = 'يمكنك إرجاع المنتج خلال 7 أيام من الاستلام بشرط أن يكون بحالته الأصلية. تواصل معنا عبر واتساب لبدء عملية الاسترجاع.';
      } else if (q.includes('منتج') || q.includes('بحث') || q.includes('اريد')) {
        reply = 'إذا لم تجد المنتج الذي تبحث عنه، يمكنك طلب أي منتج من خلال زر "طلب منتج غير موجود" وسنحاول توفيره لك!';
      } else {
        reply = 'شكراً لتواصلك مع المريش شوب! 😊 هل تريد معرفة المزيد عن منتجاتنا، طرق الدفع، أو الشحن؟ أنا هنا لمساعدتك!';
      }
      setAiMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 800);
  };

  /* ─── REQUEST PRODUCT HANDLER ─── */
  const handleRequestProduct = () => {
    showNotification('تم إرسال طلبك بنجاح! سنتواصل معك قريباً', 'success');
    setRequestForm({ name: '', description: '', category: '', expectedPrice: '', link: '' });
    setShowRequestModal(false);
  };

  /* ─── NAVIGATE HELPERS ─── */
  const goToProduct = (id: string) => {
    setSelectedProduct(id);
    setView('product');
    setSelectedSize(''); setSelectedColor(''); setProductQty(1); setActiveThumb(0);
    window.scrollTo(0, 0);
  };

  const goToShop = (catSlug?: string) => {
    if (catSlug) {
      const cat = categories.find(c => c.slug === catSlug);
      if (cat) {
        setSelectedCategory(catSlug);
        setShopSelectedCategories([cat.id]);
      }
    } else {
      setSelectedCategory(null);
      setShopSelectedCategories([]);
    }
    setView('shop'); setShopPage(1);
    window.scrollTo(0, 0);
  };

  const goToHome = () => { setView('home'); setSearchQuery(''); window.scrollTo(0, 0); };

  /* ─── LOADING SKELETON ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="text-4xl font-bold text-mareesh">المريش شوب</div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-4 rounded-full bg-gold/50" />
          <Skeleton className="h-4 w-4 rounded-full bg-mareesh/50" />
          <Skeleton className="h-4 w-4 rounded-full bg-gold/50" />
        </div>
        <p className="text-muted-foreground text-sm">جاري التحميل...</p>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     HEADER
  ════════════════════════════════════════════════════════════════ */
  const Header = () => (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${headerScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      {/* Top bar */}
      <div className="bg-mareesh-dark text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="flex items-center gap-1"><Truck size={12} /> شحن مجاني للطلبات فوق {settings.free_shipping_threshold || '5000'} ر.ي</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline flex items-center gap-1"><Phone size={12} /> {settings.store_phone || '+967776792012'}</span>
            <button
              onClick={() => setCurrency(currency === 'YER' ? 'USD' : 'YER')}
              className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold hover:bg-white/30 transition-colors"
            >
              {currency === 'YER' ? 'ر.ي' : 'USD'}
            </button>
          </div>
        </div>
      </div>
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={goToHome} className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-mareesh rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-gold" size={22} />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-mareesh leading-tight">المريش شوب</div>
              <div className="text-[10px] text-gold font-medium -mt-0.5">AL-MAREESH SHOP</div>
            </div>
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gold" size={18} />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (view !== 'shop') setView('shop'); }}
                className="pr-10 pl-4 h-10 bg-cream-dark/50 border-gold/20 focus:border-mareesh rounded-full"
                onKeyDown={(e) => { if (e.key === 'Enter') { setView('shop'); setShopPage(1); } }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={goToHome} className={view === 'home' ? 'text-mareesh font-bold' : ''}>الرئيسية</Button>
            <Button variant="ghost" size="sm" onClick={() => goToShop()} className={view === 'shop' ? 'text-mareesh font-bold' : ''}>المتجر</Button>
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                الأقسام <ChevronDown size={14} />
              </Button>
              <div className="absolute top-full right-0 bg-white border border-border rounded-lg shadow-xl py-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {categories.slice(0, 6).map((cat) => (
                  <button key={cat.id} onClick={() => goToShop(cat.slug)}
                    className="w-full text-right px-4 py-2 hover:bg-cream-dark text-sm flex items-center justify-between">
                    <span>{cat.name}</span>
                    <Badge variant="secondary" className="text-xs">{cat._count?.products || 0}</Badge>
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView('contact')}>تواصل معنا</Button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setView('cart')}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => {
              if (user?.role === 'admin') { setView('admin'); setAdminTab('dashboard'); }
              else if (user) { setView('home'); }
              else { setAuthMode('login'); setShowAuthModal(true); }
            }}>
              <User size={20} />
              {user && <span className="absolute -top-1 -right-1 bg-green-500 rounded-full w-2.5 h-2.5" />}
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex text-xs text-muted-foreground">
                خروج
              </Button>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (view !== 'shop') setView('shop'); }}
              className="pr-9 pl-4 h-9 bg-cream-dark/50 rounded-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => { goToHome(); setMobileMenuOpen(false); }}>الرئيسية</Button>
            <Button variant="ghost" className="justify-start" onClick={() => { goToShop(); setMobileMenuOpen(false); }}>المتجر</Button>
            {categories.slice(0, 6).map((cat) => (
              <Button key={cat.id} variant="ghost" className="justify-start mr-4 text-sm" onClick={() => { goToShop(cat.slug); setMobileMenuOpen(false); }}>
                {cat.name}
              </Button>
            ))}
            <Button variant="ghost" className="justify-start" onClick={() => { setView('contact'); setMobileMenuOpen(false); }}>تواصل معنا</Button>
            {user?.role === 'admin' && (
              <Button variant="ghost" className="justify-start text-mareesh" onClick={() => { setView('admin'); setAdminTab('dashboard'); setMobileMenuOpen(false); }}>
                لوحة التحكم
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );

  /* ════════════════════════════════════════════════════════════════
     HOME VIEW
  ════════════════════════════════════════════════════════════════ */
  const HomeView = () => {
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
    const bestsellerProducts = products.filter(p => p.isBestseller).slice(0, 8);
    const newProducts = products.filter(p => p.isNew).slice(0, 8);
    const mainCategories = categories.filter(c => !c.parentId).slice(0, 3);

    const categoryIcons: Record<string, React.ReactNode> = {
      'kids-clothing': <Baby size={32} />,
      'women-clothing': <Shirt size={32} />,
      'shoes': <Footprints size={32} />,
    };
    const categoryColors: Record<string, string> = {
      'kids-clothing': 'from-pink-400 to-rose-500',
      'women-clothing': 'from-mareesh to-mareesh-light',
      'shoes': 'from-amber-400 to-orange-500',
    };

    return (
      <div className="animate-fade-in">
        {/* Hero Slider */}
        {sliders.length > 0 && (
          <div className="relative overflow-hidden bg-mareesh-dark">
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px]" style={{ transition: 'all 0.5s ease' }}>
              {sliders.map((slide, idx) => (
                <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-l from-mareesh-dark/80 via-mareesh-dark/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 w-full">
                      <div className="max-w-lg">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">{slide.title}</h2>
                        {slide.subtitle && <p className="text-white/90 text-sm sm:text-lg mb-6">{slide.subtitle}</p>}
                        <Button onClick={() => goToShop()} className="bg-gold hover:bg-gold-light text-white font-bold px-8 h-12 rounded-full text-base">
                          تسوق الآن <ArrowLeft size={18} className="mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Slider controls */}
            <button onClick={() => setCurrentSlide((currentSlide - 1 + sliders.length) % sliders.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-all">
              <ChevronRight size={24} />
            </button>
            <button onClick={() => setCurrentSlide((currentSlide + 1) % sliders.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-all">
              <ChevronLeft size={24} />
            </button>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" dir="ltr">
              {sliders.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-gold w-8' : 'bg-white/50'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-mareesh mb-2">تسوق حسب القسم</h2>
            <p className="text-muted-foreground">اكتشف تشكيلاتنا المميزة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {mainCategories.map((cat) => (
              <button key={cat.id} onClick={() => goToShop(cat.slug)}
                className="group relative overflow-hidden rounded-2xl h-56 shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[cat.slug] || 'from-mareesh to-mareesh-light'} transition-transform duration-500 group-hover:scale-110`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">{categoryIcons[cat.slug] || <ShoppingBag size={32} />}</div>
                  <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-white/80 text-sm mb-3">{cat._count?.products || 0} منتج</p>
                  <span className="text-gold font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    تسوق الآن <ArrowLeft size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-mareesh flex items-center gap-2">
                  <Sparkles className="text-gold" size={24} /> منتجات مميزة
                </h2>
                <p className="text-muted-foreground text-sm mt-1">أفضل ما لدينا لك</p>
              </div>
              <Button variant="outline" onClick={() => goToShop()} className="border-mareesh text-mareesh hover:bg-mareesh hover:text-white">
                عرض الكل <ArrowLeft size={16} className="mr-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((p) => (<div key={p.id}>{ProductCard({ product: p })}</div>))}
            </div>
          </section>
        )}

        {/* Promo Banner */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-l from-mareesh via-mareesh-light to-mareesh rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gold/10 rounded-full translate-x-1/4 translate-y-1/4" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <Badge className="bg-gold text-white mb-3 text-sm">عرض محدود</Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">خصم يصل إلى 40%</h3>
                <p className="text-white/80">على جميع ملابس الأطفال - استخدم كود WELCOME10</p>
              </div>
              <Button onClick={() => goToShop('kids-clothing')} className="bg-gold hover:bg-gold-light text-white font-bold px-8 h-12 rounded-full text-base shrink-0">
                تسوق الآن
              </Button>
            </div>
          </div>
        </section>

        {/* Bestsellers */}
        {bestsellerProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-mareesh flex items-center gap-2">
                  <TrendingUp className="text-gold" size={24} /> الأكثر مبيعاً
                </h2>
                <p className="text-muted-foreground text-sm mt-1">منتجات يحبها عملاؤنا</p>
              </div>
              <Button variant="outline" onClick={() => { setShopSort('bestseller'); goToShop(); }} className="border-mareesh text-mareesh hover:bg-mareesh hover:text-white">
                عرض الكل <ArrowLeft size={16} className="mr-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestsellerProducts.map((p) => (<div key={p.id}>{ProductCard({ product: p })}</div>))}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12 bg-cream-dark/30">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-mareesh flex items-center gap-2">
                  <Sparkles className="text-gold" size={24} /> وصل حديثاً
                </h2>
                <p className="text-muted-foreground text-sm mt-1">أحدث المنتجات في متجرنا</p>
              </div>
              <Button variant="outline" onClick={() => goToShop()} className="border-mareesh text-mareesh hover:bg-mareesh hover:text-white">
                عرض الكل <ArrowLeft size={16} className="mr-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newProducts.map((p) => (<div key={p.id}>{ProductCard({ product: p })}</div>))}
            </div>
          </section>
        )}

        {/* Bundles / Packages */}
        <section className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-b from-cream to-white">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-mareesh flex items-center justify-center gap-2">
              <Gift className="text-gold" size={24} /> باقات هدايا مميزة
            </h2>
            <p className="text-muted-foreground text-sm mt-1">مجموعات خاصة بأسعار لا تُقاوم</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => {
              const originalTotal = bundle.products.reduce((s, p) => s + p.price * p.quantity, 0);
              const bundlePrice = Math.round(originalTotal * (1 - bundle.discount / 100));
              return (
                <Card key={bundle.id} className="overflow-hidden border-2 border-gold/20 hover:border-gold/50 hover:shadow-xl transition-all group">
                  <div className="bg-gradient-to-l from-mareesh to-mareesh-light p-4 text-white relative">
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">-{bundle.discount}%</Badge>
                    <h3 className="font-bold text-lg">{bundle.name}</h3>
                    <p className="text-white/70 text-xs">{bundle.description}</p>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    {bundle.products.map((bp, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-dashed pb-2 last:border-0">
                        <span className="text-muted-foreground">{bp.name} × {bp.quantity}</span>
                        <span className="font-medium">{formatPriceCurrency(bp.price * bp.quantity)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground line-through">{formatPriceCurrency(originalTotal)}</span>
                        <span className="text-lg font-bold text-mareesh mr-2">{formatPriceCurrency(bundlePrice)}</span>
                      </div>
                      <Button size="sm" className="bg-gold hover:bg-gold-light text-white font-bold rounded-full"
                        onClick={() => {
                          bundle.products.forEach(bp => {
                            setCart(prev => [...prev, {
                              productId: bp.productId || 'bundle-' + bundle.id + '-' + i,
                              name: bp.name, price: Math.round(bp.price * (1 - bundle.discount / 100)),
                              image: bp.image || '', quantity: bp.quantity, stock: 99, maxStock: 99
                            }]);
                          });
                          showNotification(`تمت إضافة باقة "${bundle.name}" للسلة`, 'success');
                        }}>
                        اشتري الآن
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Brands */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-mareesh flex items-center justify-center gap-2">
              <Crown className="text-gold" size={24} /> علاماتنا التجارية
            </h2>
            <p className="text-muted-foreground text-sm mt-1">أفضل الماركات العالمية والمحلية</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[...new Set(products.filter(p => p.brand).map(p => p.brand))].slice(0, 6).map((brand, idx) => (
              <button key={idx} onClick={() => { setSearchQuery(brand || ''); setView('shop'); }}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gold/10 hover:border-gold/40 hover:shadow-md transition-all">
                <Store size={24} className="text-gold mb-2" />
                <span className="text-sm font-medium text-mareesh">{brand}</span>
              </button>
            ))}
            {products.filter(p => p.brand).length === 0 && (
              <>
                {['أديداس', 'نايكي', 'زارا', 'إتش آند إم', 'بيير كاردان', 'شي إن'].map((brand, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gold/10 hover:border-gold/40 hover:shadow-md transition-all">
                    <Store size={24} className="text-gold mb-2" />
                    <span className="text-sm font-medium text-mareesh">{brand}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={32} />, title: 'شحن سريع', desc: 'توصيل خلال 2-5 أيام' },
              { icon: <Shield size={32} />, title: 'دفع آمن', desc: 'حماية كاملة لبياناتك' },
              { icon: <RotateCcw size={32} />, title: 'استرجاع مجاني', desc: 'خلال 14 يوم' },
              { icon: <Headphones size={32} />, title: 'دعم 24/7', desc: 'نحن هنا لمساعدتك' },
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-white shadow-sm border border-gold/10 hover:shadow-md hover:border-gold/30 transition-all">
                <div className="text-gold">{badge.icon}</div>
                <h4 className="font-bold text-mareesh">{badge.title}</h4>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-mareesh py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">اشترك في نشرتنا البريدية</h3>
            <p className="text-white/70 mb-6">احصل على أحدث العروض والخصومات</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder="بريدك الإلكتروني" value={subscriberEmail} onChange={(e) => setSubscriberEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11 rounded-full" />
              <Button onClick={async () => {
              if (!subscriberEmail) return;
              try {
                const res = await fetch('/api/subscribers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: subscriberEmail }),
                });
                const data = await res.json();
                if (data.error) { showNotification(data.error, 'error'); return; }
                showNotification('تم الاشتراك بنجاح!', 'success');
                setSubscriberEmail('');
              } catch { showNotification('خطأ في الاشتراك', 'error'); }
            }}
                className="bg-gold hover:bg-gold-light text-white font-bold px-6 rounded-full shrink-0">
                اشتراك
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  /* ─── PRODUCT CARD ─── */
  const ProductCard = ({ product }: { product: ProductType }) => {
    const images = safeJsonParse(product.images);
    const discount = calcDiscount(product.price, product.comparePrice);
    const isWished = wishlist.includes(product.id);

    return (
      <Card className="product-card group cursor-pointer overflow-hidden border-gold/10 hover:border-gold/30" onClick={() => goToProduct(product.id)}>
        <div className="relative overflow-hidden">
          <div className="aspect-[3/4] bg-cream-dark">
            <img src={images[0] || ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.stock === 0 && <Badge className="bg-gray-700 text-white text-xs">إنتهى من المخزن</Badge>}
            {discount > 0 && product.stock > 0 && <Badge className="bg-red-500 text-white text-xs">-{discount}%</Badge>}
            {product.isNew && product.stock > 0 && <Badge className="bg-emerald-500 text-white text-xs">جديد</Badge>}
            {product.isBestseller && product.stock > 0 && <Badge className="bg-gold text-white text-xs">الأكثر مبيعاً</Badge>}
          </div>
          {/* Out of stock overlay */}
          {product.stock === 0 && <div className="absolute inset-0 bg-black/30 z-10" />}
          {/* Wishlist */}
          <button onClick={(e) => { e.stopPropagation(); setWishlist(prev => prev.includes(product.id) ? prev.filter(x => x !== product.id) : [...prev, product.id]); }}
            className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-all">
            <Heart size={16} className={isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
          {/* Quick add / Buy Now */}
          {product.stock > 0 ? (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-gold hover:bg-gold-light text-white font-bold rounded-full text-xs"
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                  <ShoppingCart size={12} className="ml-1" /> أضف للسلة
                </Button>
                <Button size="sm" className="flex-1 bg-mareesh hover:bg-mareesh-dark text-white font-bold rounded-full text-xs"
                  onClick={(e) => { e.stopPropagation(); addToCart(product); setView('cart'); }}>
                  اشتري الآن
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <CardContent className="p-3 md:p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${product.stock === 0 ? 'text-gray-400' : 'text-mareesh'}`}>{formatPriceCurrency(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPriceCurrency(product.comparePrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <StarRating rating={Math.round(product.avgRating)} size={12} />
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  /* ════════════════════════════════════════════════════════════════
     SHOP VIEW
  ════════════════════════════════════════════════════════════════ */
  const ShopView = () => (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={goToHome} className="hover:text-mareesh">الرئيسية</button>
        <ChevronLeft size={14} />
        <span className="text-mareesh font-medium">المتجر</span>
        {selectedCategory && (
          <>
            <ChevronLeft size={14} />
            <span className="text-mareesh font-medium">{categories.find(c => c.slug === selectedCategory)?.name}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <Card className="sticky top-36">
            <CardHeader><CardTitle className="text-lg">تصفية</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-sm mb-3">الأقسام</h4>
                <div className="space-y-2">
                  {categories.filter(c => !c.parentId).map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={shopSelectedCategories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) setShopSelectedCategories([...shopSelectedCategories, cat.id]);
                          else setShopSelectedCategories(shopSelectedCategories.filter(x => x !== cat.id));
                          setShopPage(1);
                        }}
                        className="rounded border-gold text-mareesh focus:ring-mareesh" />
                      <span>{cat.name}</span>
                      <Badge variant="secondary" className="text-xs mr-auto">{cat._count?.products || 0}</Badge>
                    </label>
                  ))}
                </div>
              </div>
              <Separator />
              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-sm mb-3">نطاق السعر</h4>
                <div className="flex gap-2 items-center">
                  <Input type="number" placeholder="من" value={shopPriceRange[0] || ''} onChange={(e) => { setShopPriceRange([Number(e.target.value), shopPriceRange[1]]); setShopPage(1); }} className="h-8 text-sm" />
                  <span>-</span>
                  <Input type="number" placeholder="إلى" value={shopPriceRange[1] || ''} onChange={(e) => { setShopPriceRange([shopPriceRange[0], Number(e.target.value)]); setShopPage(1); }} className="h-8 text-sm" />
                </div>
              </div>
              <Separator />
              <Button variant="outline" className="w-full text-sm" onClick={() => { setShopSelectedCategories([]); setShopPriceRange([0, 1000]); setSearchQuery(''); setShopPage(1); }}>
                إعادة تعيين الفلاتر
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort & Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-muted-foreground">
              عرض {paginatedProducts.length} من {sortedProducts.length} منتج
            </p>
            <Select value={shopSort} onValueChange={setShopSort}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price-low">السعر: الأقل</SelectItem>
                <SelectItem value="price-high">السعر: الأعلى</SelectItem>
                <SelectItem value="bestseller">الأكثر مبيعاً</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {paginatedProducts.map((p) => (<div key={p.id}>{ProductCard({ product: p })}</div>))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground text-sm">جرب تغيير معايير البحث</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8" dir="ltr">
              <Button variant="outline" size="sm" disabled={shopPage === 1} onClick={() => setShopPage(shopPage - 1)}>
                <ChevronRight size={16} />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = Math.max(1, Math.min(shopPage - 2, totalPages - 4)) + i;
                if (page > totalPages) return null;
                return (
                  <Button key={page} variant={page === shopPage ? 'default' : 'outline'} size="sm"
                    onClick={() => setShopPage(page)} className="w-9 h-9 p-0">
                    {page}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={shopPage === totalPages} onClick={() => setShopPage(shopPage + 1)}>
                <ChevronLeft size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     PRODUCT DETAIL VIEW
  ════════════════════════════════════════════════════════════════ */
  const ProductDetailView = () => {
    if (!currentProduct) return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p>المنتج غير موجود</p>
        <Button onClick={() => goToShop()} className="mt-4">العودة للمتجر</Button>
      </div>
    );

    const images = safeJsonParse(currentProduct.images);
    const sizes: string[] = safeJsonParse(currentProduct.sizes);
    const colors: { name: string; hex: string }[] = safeJsonParse(currentProduct.colors, []);
    const discount = calcDiscount(currentProduct.price, currentProduct.comparePrice);
    const relatedProducts = products.filter(p => p.categoryId === currentProduct.categoryId && p.id !== currentProduct.id).slice(0, 4);
    const isWished = wishlist.includes(currentProduct.id);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={goToHome} className="hover:text-mareesh">الرئيسية</button>
          <ChevronLeft size={14} />
          <button onClick={() => goToShop()} className="hover:text-mareesh">المتجر</button>
          <ChevronLeft size={14} />
          <button onClick={() => goToShop(currentProduct.category?.slug)} className="hover:text-mareesh">{currentProduct.category?.name}</button>
          <ChevronLeft size={14} />
          <span className="text-mareesh font-medium line-clamp-1">{currentProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-cream-dark rounded-xl overflow-hidden mb-4">
              <img src={images[activeThumb] || images[0] || '/logo.svg'} alt={currentProduct.name} className="w-full h-full object-cover" />
            </div>
            {/* All image thumbnails */}
            {images.filter(Boolean).length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {images.map((img: string, idx: number) => (
                  img ? (
                    <button key={idx} onClick={() => setActiveThumb(idx)}
                      className={`shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${idx === activeThumb ? 'border-mareesh' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ) : null
                ))}
              </div>
            )}
            {/* Reality images section (images 4 & 5) */}
            {images.length > 3 && images.slice(3).some((img: string) => img) && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-mareesh mb-2">🌟 صور على الواقع</p>
                <div className="grid grid-cols-2 gap-2">
                  {images.slice(3).map((img: string, idx: number) => (
                    img ? (
                      <button key={idx} onClick={() => setActiveThumb(3 + idx)}
                        className={`rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] ${3 + idx === activeThumb ? 'border-emerald-500' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                        <img src={img} alt={`صورة واقع ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {currentProduct.isNew && <Badge className="bg-emerald-500 text-white">جديد</Badge>}
              {currentProduct.isBestseller && <Badge className="bg-gold text-white">الأكثر مبيعاً</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-mareesh mb-2">{currentProduct.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={Math.round(currentProduct.avgRating)} />
              <span className="text-sm text-muted-foreground">({currentProduct.reviewCount} تقييم)</span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">{currentProduct.totalSold} مبيعات</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-mareesh">{formatPrice(currentProduct.price)}</span>
              {currentProduct.comparePrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(currentProduct.comparePrice)}</span>
                  <Badge className="bg-red-500 text-white">وفر {discount}%</Badge>
                </>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">المقاس</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-11 rounded-lg border-2 text-sm font-medium transition-all ${selectedSize === s ? 'border-mareesh bg-mareesh text-white' : 'border-border hover:border-mareesh/50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">اللون: {selectedColor && colors.find(c => c.hex === selectedColor)?.name}</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button key={c.hex} onClick={() => setSelectedColor(c.hex)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === c.hex ? 'border-mareesh scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.hex }} title={c.name}>
                      {selectedColor === c.hex && <Check size={16} className={c.hex === '#FFFFFF' || c.hex === '#F5F5DC' ? 'text-gray-800' : 'text-white'} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">الكمية</h4>
              <div className="flex items-center gap-0 border rounded-lg w-fit">
                <button onClick={() => setProductQty(Math.max(1, productQty - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-cream-dark rounded-r-lg">
                  <Minus size={16} />
                </button>
                <span className="w-12 h-11 flex items-center justify-center border-x font-medium">{productQty}</span>
                <button onClick={() => setProductQty(Math.min(currentProduct.stock, productQty + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-cream-dark rounded-l-lg">
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentProduct.stock} متوفر في المخزون</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <Button onClick={() => addToCart(currentProduct)} className="flex-1 bg-gold hover:bg-gold-light text-white font-bold h-13 text-base rounded-xl" size="lg">
                <ShoppingCart size={20} className="ml-2" /> أضف للسلة
              </Button>
              <Button variant="outline" size="lg" className="h-13 w-13 rounded-xl border-mareesh"
                onClick={() => setWishlist(prev => prev.includes(currentProduct.id) ? prev.filter(x => x !== currentProduct.id) : [...prev, currentProduct.id])}>
                <Heart size={20} className={isWished ? 'fill-red-500 text-red-500' : ''} />
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Trust */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm"><Truck size={16} className="text-gold" /> شحن سريع</div>
              <div className="flex items-center gap-2 text-sm"><RotateCcw size={16} className="text-gold" /> استرجاع مجاني</div>
              <div className="flex items-center gap-2 text-sm"><Shield size={16} className="text-gold" /> دفع آمن</div>
              <div className="flex items-center gap-2 text-sm"><Package size={16} className="text-gold" /> SKU: {currentProduct.sku}</div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">الوصف</TabsTrigger>
              <TabsTrigger value="reviews">التقييمات ({currentProduct.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <Card><CardContent className="p-6 leading-relaxed text-muted-foreground">{currentProduct.description}</CardContent></Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {/* Review summary */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-mareesh">{currentProduct.avgRating.toFixed(1)}</div>
                      <StarRating rating={Math.round(currentProduct.avgRating)} />
                      <p className="text-xs text-muted-foreground mt-1">{currentProduct.reviewCount} تقييم</p>
                    </div>
                  </div>
                  {/* Review form */}
                  {user && (
                    <div className="mb-6 p-4 bg-cream-dark/30 rounded-xl">
                      <h4 className="font-semibold mb-3">اكتب تقييمك</h4>
                      <div className="mb-3"><StarRating rating={reviewRating} onChange={setReviewRating} size={24} /></div>
                      <Textarea placeholder="شاركنا رأيك..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="mb-3" />
                      <Button onClick={() => { showNotification('شكراً لتقييمك!', 'success'); setReviewComment(''); }} className="bg-mareesh">
                        إرسال التقييم
                      </Button>
                    </div>
                  )}
                  {!user && (
                    <div className="mb-6 p-4 bg-cream-dark/30 rounded-xl text-center">
                      <p className="text-sm text-muted-foreground mb-2">سجل دخولك لكتابة تقييم</p>
                      <Button variant="outline" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>تسجيل الدخول</Button>
                    </div>
                  )}
                  {/* Placeholder reviews */}
                  {currentProduct.reviewCount > 0 ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-mareesh/10 rounded-full flex items-center justify-center"><User size={14} className="text-mareesh" /></div>
                            <span className="text-sm font-medium">عميل {i}</span>
                            <StarRating rating={5 - i} size={12} />
                          </div>
                          <p className="text-sm text-muted-foreground">منتج رائع وجودة عالية، أنصح به بشدة!</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">لا توجد تقييمات بعد</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-mareesh mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (<div key={p.id}>{ProductCard({ product: p })}</div>))}
            </div>
          </section>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════
     CART VIEW
  ════════════════════════════════════════════════════════════════ */
  const CartView = () => (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-mareesh mb-6 flex items-center gap-2"><ShoppingCart size={24} /> سلة التسوق</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">سلتك فارغة</h3>
          <p className="text-muted-foreground mb-6">اكتشف منتجاتنا المميزة وأضف ما يعجبك</p>
          <Button onClick={() => goToShop()} className="bg-mareesh hover:bg-mareesh-dark">تسوق الآن</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">المقاس</TableHead>
                        <TableHead className="text-right">اللون</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item: CartItemType, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-lg" />
                              <span className="font-medium text-sm line-clamp-2">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{item.size || '-'}</TableCell>
                          <TableCell>
                            {item.color ? <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: item.color }} /> : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-0 border rounded-md w-fit">
                              <button onClick={() => updateCartQty(idx, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark rounded-r-md"><Minus size={12} /></button>
                              <span className="w-8 h-8 flex items-center justify-center text-sm border-x">{item.quantity}</span>
                              <button onClick={() => updateCartQty(idx, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark rounded-l-md"><Plus size={12} /></button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{formatPrice(item.price)}</TableCell>
                          <TableCell className="text-sm font-bold text-mareesh">{formatPrice(item.price * item.quantity)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeCartItem(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden divide-y">
                  {cart.map((item: CartItemType, idx: number) => (
                    <div key={idx} className="p-4 flex gap-3">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1 mb-1">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          {item.size && <span>مقاس: {item.size}</span>}
                          {item.color && <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: item.color }} />}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0 border rounded-md">
                            <button onClick={() => updateCartQty(idx, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center"><Minus size={12} /></button>
                            <span className="w-7 h-7 flex items-center justify-center text-xs border-x">{item.quantity}</span>
                            <button onClick={() => updateCartQty(idx, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center"><Plus size={12} /></button>
                          </div>
                          <span className="font-bold text-mareesh text-sm">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeCartItem(idx)} className="text-red-500 shrink-0 h-8 w-8">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-36">
              <CardHeader><CardTitle className="text-lg">ملخص الطلب</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <Input placeholder="كود الخصم" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="h-9 text-sm" />
                  <Button variant="outline" onClick={applyCoupon} className="shrink-0 h-9 text-sm border-mareesh text-mareesh">تطبيق</Button>
                </div>
                {/* Cart Notes */}
                <div>
                  <Label className="text-xs text-muted-foreground">ملاحظات (اختياري)</Label>
                  <Textarea value={cartNotes} onChange={(e) => setCartNotes(e.target.value)} placeholder="ملاحظات خاصة بطلبك..." className="h-16 text-sm resize-none mt-1" />
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span><span>{formatPrice(cartSubtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">الشحن</span><span>{shippingCost === 0 ? <span className="text-green-600">مجاني</span> : formatPrice(shippingCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">الضريبة (2%)</span><span>{formatPrice(cartTax)}</span></div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600"><span>الخصم</span><span>-{formatPrice(couponDiscount)}</span></div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span className="text-mareesh">{formatPrice(cartTotal)}</span>
                </div>
                <Button onClick={() => { setView('checkout'); setCheckoutStep(1); setOrderPlaced(false); }} className="w-full bg-gold hover:bg-gold-light text-white font-bold h-12 rounded-xl" size="lg">
                  إتمام الشراء
                </Button>
                <Button variant="outline" onClick={() => goToShop()} className="w-full">متابعة التسوق</Button>
                {/* Share cart via WhatsApp */}
                <Button variant="outline" className="w-full border-green-400 text-green-600 hover:bg-green-50 flex items-center gap-2"
                  onClick={() => {
                    const items = cart.map((c: CartItemType) => `${c.name} × ${c.quantity} = ${formatPrice(c.price * c.quantity)}`).join('\n');
                    const msg = `🛒 سلة التسوق - المريش شوب\n\n${items}\n\nالمجموع: ${formatPrice(cartTotal)}\n\nأريد تأكيد الطلب`;
                    window.open(`https://wa.me/${settings.store_phone?.replace(/[^0-9]/g, '') || '967776792012'}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}>
                  <MessageCircle size={16} /> مشاركة عبر واتساب
                </Button>
                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs"><Truck size={16} className="text-green-600 shrink-0" /><span className="text-green-700">توصيل سريع</span></div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-xs"><Shield size={16} className="text-blue-600 shrink-0" /><span className="text-blue-700">منتجات أصلية 100%</span></div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg text-xs"><RotateCcw size={16} className="text-purple-600 shrink-0" /><span className="text-purple-700">إمكانية الإرجاع</span></div>
                  <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-xs"><Headphones size={16} className="text-amber-600 shrink-0" /><span className="text-amber-700">دعم متواصل</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     CHECKOUT VIEW
  ════════════════════════════════════════════════════════════════ */
  const CheckoutView = () => {
    if (orderPlaced && placedOrder) {
      return (
        <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-mareesh mb-2">تم تقديم الطلب بنجاح!</h2>
          <p className="text-muted-foreground mb-4">رقم الطلب: <span className="font-bold text-mareesh">{placedOrder.orderNumber}</span></p>
          <p className="text-sm text-muted-foreground mb-6">سيتم التواصل معك قريباً لتأكيد الطلب</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={goToHome} className="bg-mareesh">العودة للرئيسية</Button>
            <Button variant="outline" onClick={() => goToShop()}>تسوق المزيد</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-mareesh mb-6">إتمام الشراء</h1>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8" dir="ltr">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkoutStep >= s ? 'bg-mareesh text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              <span className={`text-xs hidden sm:inline ${checkoutStep >= s ? 'text-mareesh font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'الشحن' : s === 2 ? 'الدفع' : 'التأكيد'}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${checkoutStep > s ? 'bg-mareesh' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {checkoutStep === 1 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={20} /> معلومات الشحن</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>الاسم الكامل *</Label><Input value={checkoutForm.name} onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })} placeholder="محمد أحمد" /></div>
                    <div><Label>رقم الجوال *</Label><Input value={checkoutForm.phone} onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} placeholder="+967 7XX XXX XXX" /></div>
                  </div>
                  <div><Label>العنوان *</Label><Input value={checkoutForm.address} onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })} placeholder="الحي، الشارع، رقم المبنى" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><Label>المدينة *</Label>
                      <Select value={checkoutForm.city} onValueChange={(v) => setCheckoutForm({ ...checkoutForm, city: v })}>
                        <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(yemenCities).map(city => <SelectItem key={city} value={city}>{city} {yemenCities[city] === 0 ? '(شحن مجاني)' : `(${formatPrice(yemenCities[city])} شحن)`}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>الدولة</Label><Input value={checkoutForm.country} onChange={(e) => setCheckoutForm({ ...checkoutForm, country: e.target.value })} /></div>
                    <div><Label>الرمز البريدي</Label><Input value={checkoutForm.postalCode} onChange={(e) => setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })} /></div>
                  </div>
                  <div><Label>ملاحظات</Label><Textarea value={checkoutForm.notes} onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })} placeholder="ملاحظات إضافية..." /></div>
                  <Button onClick={() => setCheckoutStep(2)} className="w-full bg-mareesh h-11">التالي: طريقة الدفع</Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 2 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard size={20} /> طريقة الدفع</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { 
                      value: 'karimi', 
                      label: 'كريمي (Karimi)', 
                      icon: <Banknote size={24} />, 
                      desc: 'تحويل المبلغ عبر شركة كريمي',
                      details: (
                        <div className="mt-3 p-3 bg-mareesh/5 rounded-lg border border-mareesh/20 space-y-2 text-sm animate-fade-in">
                          <p className="font-bold text-mareesh">تفاصيل الدفع عبر كريمي:</p>
                          <div className="flex items-center gap-2"><span className="text-muted-foreground">اسم المستلم:</span><span className="font-medium">المريش شوب</span></div>
                          <div className="flex items-center gap-2"><span className="text-muted-foreground">رقم الهاتف:</span><span className="font-medium font-mono" dir="ltr">+967 776 792 012</span></div>
                          <p className="text-xs text-muted-foreground mt-2">يرجى تحويل المبلغ ثم إرسال إيصال التحويل عبر واتساب</p>
                        </div>
                      )
                    },
                    { 
                      value: 'qutaibi', 
                      label: 'قطيبي (Qutaibi)', 
                      icon: <CreditCard size={24} />, 
                      desc: 'تحويل المبلغ عبر شركة قطيبي',
                      details: (
                        <div className="mt-3 p-3 bg-gold/10 rounded-lg border border-gold/20 space-y-2 text-sm animate-fade-in">
                          <p className="font-bold text-gold">تفاصيل الدفع عبر قطيبي:</p>
                          <div className="flex items-center gap-2"><span className="text-muted-foreground">اسم المستلم:</span><span className="font-medium">المريش شوب</span></div>
                          <div className="flex items-center gap-2"><span className="text-muted-foreground">رقم الهاتف:</span><span className="font-medium font-mono" dir="ltr">+967 776 792 012</span></div>
                          <p className="text-xs text-muted-foreground mt-2">يرجى تحويل المبلغ ثم إرسال إيصال التحويل عبر واتساب</p>
                        </div>
                      )
                    },
                    { 
                      value: 'jeeb', 
                      label: 'محفظة جيب (Jeeb)', 
                      icon: <Wallet size={24} />, 
                      desc: 'الدفع عبر محفظة جيب الإلكترونية',
                      details: (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2 text-sm animate-fade-in">
                          <p className="font-bold text-emerald-700">تفاصيل الدفع عبر محفظة جيب:</p>
                          <div className="flex items-center gap-2"><span className="text-muted-foreground">رقم المحفظة:</span><span className="font-medium font-mono" dir="ltr">+967 776 792 012</span></div>
                          <div className="flex items-center gap-2"><span className="text-muted-foreground">اسم الحساب:</span><span className="font-medium">المريش شوب</span></div>
                          <p className="text-xs text-muted-foreground mt-2">يرجى تحويل المبلغ من محفظة جيب وإرسال إيصال التحويل عبر واتساب</p>
                        </div>
                      )
                    },
                  ].map((method) => (
                    <div key={method.value}>
                      <button onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: method.value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right ${checkoutForm.paymentMethod === method.value ? 'border-mareesh bg-mareesh/5' : 'border-border hover:border-mareesh/30'}`}>
                        <div className={`p-2 rounded-lg ${checkoutForm.paymentMethod === method.value ? 'bg-mareesh text-white' : 'bg-cream-dark text-muted-foreground'}`}>{method.icon}</div>
                        <div>
                          <p className="font-medium">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                        {checkoutForm.paymentMethod === method.value && <Check size={20} className="text-mareesh mr-auto" />}
                      </button>
                      {checkoutForm.paymentMethod === method.value && method.details}
                    </div>
                  ))}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCheckoutStep(1)} className="flex-1">السابق</Button>
                    <Button onClick={() => setCheckoutStep(3)} className="flex-1 bg-mareesh">التالي: المراجعة</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirm */}
            {checkoutStep === 3 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Check size={20} /> تأكيد الطلب</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-cream-dark/30 rounded-xl p-4 space-y-2 text-sm">
                    <h4 className="font-semibold mb-2">معلومات الشحن</h4>
                    <p>{checkoutForm.name} | {checkoutForm.phone}</p>
                    <p>{checkoutForm.address}, {checkoutForm.city}, {checkoutForm.country}</p>
                    <Separator className="my-3" />
                    <h4 className="font-semibold mb-2">طريقة الدفع</h4>
                    <p>{checkoutForm.paymentMethod === 'karimi' ? 'كريمي (Karimi)' : checkoutForm.paymentMethod === 'qutaibi' ? 'قطيبي (Qutaibi)' : checkoutForm.paymentMethod === 'jeeb' ? 'محفظة جيب (Jeeb)' : checkoutForm.paymentMethod}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">المنتجات</h4>
                    {cart.map((item: CartItemType, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg">
                        <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-mareesh">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setCheckoutStep(2)} className="flex-1">السابق</Button>
                    <Button onClick={placeOrder} className="flex-1 bg-gold hover:bg-gold-light text-white font-bold h-12 text-base" size="lg">
                      تأكيد الطلب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div>
            <Card className="sticky top-36">
              <CardHeader><CardTitle className="text-lg">ملخص الطلب</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {cart.map((item: CartItemType, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground line-clamp-1">{item.name} × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span><span>{formatPrice(cartSubtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">الشحن</span><span>{shippingCost === 0 ? <span className="text-green-600">مجاني</span> : formatPrice(shippingCost)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>-{formatPrice(couponDiscount)}</span></div>}
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span className="text-mareesh">{formatPrice(cartTotal)}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════
     AUTH MODAL
  ════════════════════════════════════════════════════════════════ */
  const AuthModal = () => (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-mareesh rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="text-gold" size={28} />
          </div>
          <h2 className="text-xl font-bold text-mareesh">المريش شوب</h2>
        </div>
        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">إنشاء حساب</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4 space-y-4">
            <div><Label>البريد الإلكتروني</Label><Input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="بريدك الإلكتروني" /></div>
            <div><Label>كلمة المرور</Label><Input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" /></div>
            <Button onClick={handleLogin} className="w-full bg-mareesh hover:bg-mareesh-dark h-11">تسجيل الدخول</Button>
          </TabsContent>
          <TabsContent value="register" className="mt-4 space-y-4">
            <div><Label>الاسم</Label><Input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="محمد أحمد" /></div>
            <div><Label>البريد الإلكتروني</Label><Input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="email@example.com" /></div>
            <div><Label>رقم الجوال</Label><Input value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="+967 7XX XXX XXX" /></div>
            <div><Label>كلمة المرور</Label><Input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" /></div>
            <Button onClick={handleRegister} className="w-full bg-mareesh hover:bg-mareesh-dark h-11">إنشاء حساب</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  /* ════════════════════════════════════════════════════════════════
     CONTACT VIEW
  ════════════════════════════════════════════════════════════════ */
  const ContactView = () => (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-mareesh mb-8 text-center">تواصل معنا</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>أرسل لنا رسالة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>الاسم</Label><Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /></div>
            <div><Label>البريد الإلكتروني</Label><Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></div>
            <div><Label>الموضوع</Label><Input value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} /></div>
            <div><Label>الرسالة</Label><Textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} rows={4} /></div>
            <Button onClick={async () => {
              if (!contactForm.name || !contactForm.email || !contactForm.message) {
                showNotification('يرجى ملء الحقول المطلوبة', 'error'); return;
              }
              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(contactForm),
                });
                const data = await res.json();
                if (data.error) { showNotification(data.error, 'error'); return; }
                showNotification('تم إرسال رسالتك بنجاح!', 'success');
                setContactForm({ name: '', email: '', subject: '', message: '' });
              } catch { showNotification('خطأ في إرسال الرسالة', 'error'); }
            }}
              className="w-full bg-mareesh hover:bg-mareesh-dark">إرسال</Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-mareesh/10 rounded-xl flex items-center justify-center"><Phone className="text-mareesh" size={22} /></div>
              <div><h4 className="font-semibold">اتصل بنا</h4><p className="text-sm text-muted-foreground">{settings.store_phone || '+967776792012'}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-mareesh/10 rounded-xl flex items-center justify-center"><Mail className="text-mareesh" size={22} /></div>
              <div><h4 className="font-semibold">راسلنا</h4><p className="text-sm text-muted-foreground">{settings.store_email || 'info@mareesh.com'}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-mareesh/10 rounded-xl flex items-center justify-center"><MapPin className="text-mareesh" size={22} /></div>
              <div><h4 className="font-semibold">موقعنا</h4><p className="text-sm text-muted-foreground">اليمن</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-mareesh/10 rounded-xl flex items-center justify-center"><Clock className="text-mareesh" size={22} /></div>
              <div><h4 className="font-semibold">ساعات العمل</h4><p className="text-sm text-muted-foreground">السبت - الخميس: 9 صباحاً - 10 مساءً</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     ADMIN PANEL VIEW
  ════════════════════════════════════════════════════════════════ */
  const AdminView = () => {
    if (user?.role !== 'admin') {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">الوصول مقيّد</h3>
          <p className="text-muted-foreground text-sm mb-4">يجب تسجيل الدخول كمسؤول</p>
          <Button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>تسجيل الدخول</Button>
        </div>
      );
    }

    const tabs = [
      { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
      { id: 'products', label: 'المنتجات', icon: <Box size={18} /> },
      { id: 'categories', label: 'الفئات', icon: <Grid3X3 size={18} /> },
      { id: 'orders', label: 'الطلبات', icon: <ClipboardList size={18} /> },
      { id: 'customers', label: 'العملاء', icon: <UserCircle size={18} /> },
      { id: 'coupons', label: 'الكوبونات', icon: <Tag size={18} /> },
      { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} /> },
    ];

    return (
      <div className="flex min-h-[calc(100vh-140px)] animate-fade-in">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 bg-mareesh-dark text-white p-4">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center"><ShoppingBag size={18} className="text-white" /></div>
            <div><div className="font-bold text-sm">المريش شوب</div><div className="text-xs text-gold">لوحة التحكم</div></div>
          </div>
          <nav className="space-y-1 flex-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setAdminTab(tab.id); setShowOrderDetail(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${adminTab === tab.id && !showOrderDetail ? 'bg-gold text-white font-bold' : 'hover:bg-mareesh-light text-white/70'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
          <Button variant="ghost" className="text-white/70 hover:text-white justify-start" onClick={handleLogout}>
            <ArrowRight size={18} className="ml-2" /> تسجيل الخروج
          </Button>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs whitespace-nowrap ${adminTab === tab.id ? 'text-mareesh font-bold' : 'text-muted-foreground'}`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
          {/* Dashboard */}
          {adminTab === 'dashboard' && adminStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-mareesh">لوحة التحكم</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'المنتجات', value: adminStats.totalProducts, icon: <Package size={22} />, color: 'bg-mareesh' },
                  { label: 'الطلبات', value: adminStats.totalOrders, icon: <ShoppingBag size={22} />, color: 'bg-gold' },
                  { label: 'الإيرادات', value: formatPrice(adminStats.totalRevenue || 0), icon: <DollarSign size={22} />, color: 'bg-emerald-600' },
                  { label: 'العملاء', value: adminStats.totalUsers, icon: <Users size={22} />, color: 'bg-blue-600' },
                ].map((stat, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-11 h-11 ${stat.color} text-white rounded-xl flex items-center justify-center shrink-0`}>{stat.icon}</div>
                      <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-lg font-bold">{stat.value}</p></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Chart placeholder */}
              <Card>
                <CardHeader><CardTitle className="text-base">إحصائيات المبيعات</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48 bg-cream-dark/30 rounded-xl flex items-center justify-center">
                    <BarChart3 size={48} className="text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
              {/* Recent orders */}
              <Card>
                <CardHeader><CardTitle className="text-base">آخر الطلبات</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم الطلب</TableHead>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(adminStats.recentOrders || []).slice(0, 5).map((order: OrderType) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                          <TableCell className="text-sm">{order.shippingName}</TableCell>
                          <TableCell className="text-sm font-medium">{formatPrice(order.total)}</TableCell>
                          <TableCell><Badge className={statusColors[order.status] || ''}>{statusMap[order.status] || order.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products */}
          {adminTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-mareesh">المنتجات</h2>
                <Button onClick={() => { setEditProduct({ name: '', nameEn: '', slug: '', description: '', price: 0, comparePrice: 0, sku: '', stock: 0, images: '[]', categoryId: categories[0]?.id || '', sizes: '[]', colors: '[]', isActive: true }); setShowProductModal(true); }}
                  className="bg-gold hover:bg-gold-light text-white">
                  <Plus size={16} className="ml-1" /> إضافة منتج
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">الفئة</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">المخزون</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img src={safeJsonParse(p.images)[0] || ''} alt="" className="w-10 h-12 object-cover rounded" />
                              <div><p className="text-sm font-medium line-clamp-1">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku}</p></div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">{p.category?.name}</TableCell>
                          <TableCell className="text-sm font-medium">{formatPrice(p.price)}</TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">
                            <Badge variant={p.stock > 10 ? 'secondary' : 'destructive'} className="text-xs">{p.stock}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(p); setShowProductModal(true); }}><Edit size={14} /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></Button>
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

          {/* Categories */}
          {adminTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-mareesh">الفئات</h2>
                <Button onClick={() => { setEditCategory({ name: '', nameEn: '', slug: '', description: '', sortOrder: 0 }); setShowCategoryModal(true); }}
                  className="bg-gold hover:bg-gold-light text-white">
                  <Plus size={16} className="ml-1" /> إضافة فئة
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Card key={cat.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{cat.name}</h4>
                        <p className="text-xs text-muted-foreground">{cat.nameEn} • {cat._count?.products || 0} منتج</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCategory(cat); setShowCategoryModal(true); }}><Edit size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteCategory(cat.id)}><Trash2 size={14} /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {adminTab === 'orders' && (() => {
            const filteredOrders = adminOrders.filter(o => adminOrderFilter === 'all' || o.status === adminOrderFilter).filter(o => !adminOrderSearch || o.orderNumber.toLowerCase().includes(adminOrderSearch.toLowerCase()) || o.shippingName.includes(adminOrderSearch) || o.shippingPhone.includes(adminOrderSearch));

            // Order Detail Page View
            if (showOrderDetail && selectedOrder) {
              const o = selectedOrder;
              return (
                <div className="space-y-6 animate-fade-in">
                  {/* Back button & header */}
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowOrderDetail(false)} className="border-mareesh text-mareesh">
                      <ArrowRight size={16} className="ml-1" /> رجوع للطلبات
                    </Button>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-mareesh flex items-center gap-2">
                        <Receipt size={22} /> تفاصيل الطلب
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        رقم الطلب: <span className="font-mono font-bold text-mareesh">{o.orderNumber}</span>
                      </p>
                    </div>
                    <Badge className={`${statusColors[o.status] || ''} text-sm px-4 py-1.5`}>{statusMap[o.status] || o.status}</Badge>
                  </div>

                  {/* Status Timeline */}
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-mareesh mb-4 flex items-center gap-2"><CircleDot size={16} /> مسار الطلب</h3>
                      <div className="flex items-center justify-between" dir="ltr">
                        {['pending', 'processing', 'shipped', 'delivered'].map((s, i) => {
                          const currentIdx = ['pending', 'processing', 'shipped', 'delivered'].indexOf(o.status);
                          const isActive = i <= currentIdx && currentIdx >= 0;
                          return (
                            <div key={s} className="flex flex-col items-center flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-mareesh text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {isActive ? <Check size={18} /> : i + 1}
                              </div>
                              <span className={`text-xs mt-2 font-medium ${isActive ? 'text-mareesh' : 'text-muted-foreground'}`}>{statusMap[s]}</span>
                              {i < 3 && <div className={`h-0.5 w-full mt-5 -mb-7 ${isActive && i < currentIdx ? 'bg-mareesh' : 'bg-gray-200'}`} />}
                            </div>
                          );
                        })}
                      </div>
                      {/* Status update */}
                      <div className="mt-6 pt-4 border-t">
                        <Label className="text-sm font-medium">تحديث حالة الطلب:</Label>
                        <div className="flex gap-2 mt-2">
                          <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v)}>
                            <SelectTrigger className="h-10 w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">قيد الانتظار</SelectItem>
                              <SelectItem value="processing">قيد المعالجة</SelectItem>
                              <SelectItem value="shipped">تم الشحن</SelectItem>
                              <SelectItem value="delivered">تم التوصيل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><UserCircle size={16} className="text-mareesh" /> معلومات العميل</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-cream-dark/30 rounded-xl">
                          <div className="w-10 h-10 bg-mareesh/10 rounded-full flex items-center justify-center"><User size={18} className="text-mareesh" /></div>
                          <div>
                            <p className="font-bold text-sm">{o.shippingName}</p>
                            <p className="text-xs text-muted-foreground">العميل</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2"><PhoneCall size={14} className="text-gold" /><span className="text-muted-foreground">الهاتف:</span><span className="font-mono font-medium" dir="ltr">{o.shippingPhone}</span></div>
                          <div className="flex items-center gap-2"><MapPinned size={14} className="text-gold" /><span className="text-muted-foreground">العنوان:</span><span className="font-medium">{o.shippingAddress}</span></div>
                          <div className="flex items-center gap-2"><MapPin size={14} className="text-gold" /><span className="text-muted-foreground">المدينة:</span><span className="font-medium">{o.shippingCity}</span></div>
                          {o.notes && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                              <Notebook size={14} className="text-amber-600 mt-0.5 shrink-0" />
                              <div><span className="text-amber-700 text-xs font-medium">ملاحظات:</span> <span className="text-sm">{o.notes}</span></div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard size={16} className="text-mareesh" /> معلومات الدفع</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-cream-dark/30 rounded-xl">
                          <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                            {o.paymentMethod === 'karimi' ? <Wallet size={18} className="text-gold" /> : o.paymentMethod === 'jeeb' ? <Smartphone size={18} className="text-gold" /> : <Banknote size={18} className="text-gold" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{o.paymentMethod === 'karimi' ? 'كريمي (Karimi)' : o.paymentMethod === 'qutaibi' ? 'قطيبي (Qutaibi)' : o.paymentMethod === 'jeeb' ? 'محفظة جيب (Jeeb)' : 'عند الاستلام'}</p>
                            <p className="text-xs text-muted-foreground">طريقة الدفع</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">حالة الدفع:</span><Badge variant={o.paymentStatus === 'paid' ? 'default' : 'secondary'} className={o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : ''}>{o.paymentStatus === 'paid' ? 'مدفوع' : o.paymentStatus === 'refunded' ? 'مسترجع' : 'غير مدفوع'}</Badge></div>
                          <div className="flex items-center justify-between"><span className="text-muted-foreground">تاريخ الطلب:</span><span className="font-medium flex items-center gap-1"><CalendarDays size={14} /> {new Date(o.createdAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Items */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package size={16} className="text-mareesh" /> المنتجات ({o.items?.length || 0})</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-cream-dark/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-mareesh/10 rounded-lg flex items-center justify-center">
                              <Box size={18} className="text-mareesh" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>الكمية: {item.quantity}</span>
                                {item.size && <span>المقاس: {item.size}</span>}
                                {item.color && <span>اللون: {item.color}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-mareesh">{formatPrice(item.total)}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Totals */}
                  <Card>
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">المجموع الفرعي</span><span className="font-medium">{formatPrice(o.subtotal)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">الشحن</span><span className="font-medium">{o.shippingCost === 0 ? <span className="text-emerald-600">مجاني</span> : formatPrice(o.shippingCost)}</span></div>
                        {o.discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>الخصم</span><span>-{formatPrice(o.discount)}</span></div>}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span className="text-mareesh">{formatPrice(o.total)}</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold h-11"
                      onClick={() => {
                        const msg = `🛍️ تأكيد طلب - المريش شوب\n\nرقم الطلب: ${o.orderNumber}\nالعميل: ${o.shippingName}\nالهاتف: ${o.shippingPhone}\nالعنوان: ${o.shippingAddress}, ${o.shippingCity}\n\nالمنتجات:\n${o.items?.map(i => `• ${i.name} × ${i.quantity} = ${formatPrice(i.total)}`).join('\n')}\n\nالإجمالي: ${formatPrice(o.total)}\nطريقة الدفع: ${o.paymentMethod === 'karimi' ? 'كريمي' : o.paymentMethod === 'qutaibi' ? 'قطيبي' : o.paymentMethod === 'jeeb' ? 'جيب' : 'عند الاستلام'}`;
                        window.open(`https://wa.me/967776792012?text=${encodeURIComponent(msg)}`, '_blank');
                      }}>
                      <MessageCircle size={16} className="ml-1" /> إرسال للأدمن
                    </Button>
                    <a href={`https://wa.me/${o.shippingPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً ' + o.shippingName + '، بخصوص طلبكم رقم ' + o.orderNumber + ' من المريش شوب.')}`} target="_blank" rel="noopener noreferrer"
                      className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-mareesh hover:bg-mareesh-light text-white font-medium text-sm transition-colors">
                      <PhoneCall size={16} /> تواصل مع العميل
                    </a>
                    <Button variant="outline" className="font-bold h-11" onClick={() => {
                      navigator.clipboard.writeText(o.orderNumber);
                      showNotification('تم نسخ رقم الطلب', 'success');
                    }}>
                      <Copy size={16} className="ml-1" /> نسخ رقم الطلب
                    </Button>
                    <Button variant="outline" className="font-bold h-11" onClick={() => setShowOrderDetail(false)}>
                      <ArrowRight size={16} className="ml-1" /> رجوع للطلبات
                    </Button>
                  </div>
                </div>
              );
            }

            // Orders List View
            return (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-mareesh">الطلبات ({filteredOrders.length})</h2>
                <Button onClick={() => setAdminRefreshKey(k => k + 1)} variant="outline" size="sm" className="border-mareesh text-mareesh">
                  <RotateCcw size={14} className="ml-1" /> تحديث
                </Button>
              </div>
              {/* Order Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input placeholder="بحث برقم الطلب، الاسم، أو الهاتف..." value={adminOrderSearch} onChange={(e) => setAdminOrderSearch(e.target.value)} className="pr-9 h-9 text-sm" />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[{value:'all',label:'الكل'},{value:'pending',label:'قيد الانتظار'},{value:'processing',label:'قيد المعالجة'},{value:'shipped',label:'تم الشحن'},{value:'delivered',label:'تم التوصيل'},{value:'cancelled',label:'ملغي'}].map(f => (
                    <button key={f.value} onClick={() => setAdminOrderFilter(f.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${adminOrderFilter === f.value ? 'bg-mareesh text-white' : 'bg-cream-dark text-muted-foreground hover:bg-mareesh/10'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
                    <p>لا توجد طلبات</p>
                    <p className="text-sm mt-1">ستظهر الطلبات هنا عندما يقدم العملاء طلباتهم</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="cursor-pointer hover:border-mareesh/40 hover:shadow-md transition-all" onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-mareesh/10 rounded-xl flex items-center justify-center">
                              <Receipt size={18} className="text-mareesh" />
                            </div>
                            <div>
                              <span className="font-mono font-bold text-mareesh">{order.orderNumber}</span>
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays size={10} /> {new Date(order.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <Badge className={statusColors[order.status] || ''}>{statusMap[order.status] || order.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><UserCircle size={10} /> العميل</p>
                            <p className="font-medium">{order.shippingName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><PhoneCall size={10} /> الهاتف</p>
                            <p className="font-mono text-xs" dir="ltr">{order.shippingPhone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPinned size={10} /> المدينة</p>
                            <p className="font-medium">{order.shippingCity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard size={10} /> المبلغ</p>
                            <p className="font-bold text-mareesh">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <span className="text-xs text-muted-foreground">
                            {order.paymentMethod === 'karimi' ? '💳 كريمي' : order.paymentMethod === 'qutaibi' ? '💳 قطيبي' : order.paymentMethod === 'jeeb' ? '💳 جيب' : '💵 عند الاستلام'}
                          </span>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <a href={`https://wa.me/${order.shippingPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً ' + order.shippingName + '، بخصوص طلبكم رقم ' + order.orderNumber + ' من المريش شوب.')}`} target="_blank" rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 text-xs flex items-center gap-1">
                              <MessageCircle size={14} /> واتساب
                            </a>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-mareesh"
                              onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}>
                              <Eye size={14} className="ml-1" /> عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            );
          })()}

          {/* Customers */}
          {adminTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-mareesh">العملاء ({adminCustomers.length})</h2>
              </div>
              {adminCustomers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p>لا يوجد عملاء بعد</p>
                    <p className="text-sm mt-1">سيظهر العملاء هنا عند تسجيلهم أو تقديم طلبات</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">البريد</TableHead>
                            <TableHead className="text-right">الهاتف</TableHead>
                            <TableHead className="text-right">المدينة</TableHead>
                            <TableHead className="text-right">الطلبات</TableHead>
                            <TableHead className="text-right">إجمالي المشتريات</TableHead>
                            <TableHead className="text-right">تاريخ التسجيل</TableHead>
                            <TableHead className="text-right">واتساب</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminCustomers.map((customer: any) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium text-sm">{customer.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{customer.email}</TableCell>
                              <TableCell className="text-sm font-mono" dir="ltr">{customer.phone || '-'}</TableCell>
                              <TableCell className="text-sm">{customer.city || '-'}</TableCell>
                              <TableCell className="text-sm font-bold text-mareesh">{customer.orderCount || 0}</TableCell>
                              <TableCell className="text-sm font-bold">{customer.totalSpent ? formatPrice(customer.totalSpent) : '0 ر.ي'}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{new Date(customer.createdAt).toLocaleDateString('ar-YE')}</TableCell>
                              <TableCell>
                                {customer.phone && (
                                  <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs">
                                    <MessageCircle size={14} /> تواصل
                                  </a>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="md:hidden divide-y">
                      {adminCustomers.map((customer: any) => (
                        <div key={customer.id} className="p-4 space-y-2">
                          <div className="flex justify-between"><span className="font-medium">{customer.name}</span><span className="text-xs text-muted-foreground">{customer.orderCount || 0} طلب</span></div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-muted-foreground">الهاتف:</span><span dir="ltr">{customer.phone || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">المشتريات:</span><span className="font-bold">{customer.totalSpent ? formatPrice(customer.totalSpent) : '0 ر.ي'}</span></div>
                          </div>
                          {customer.phone && (
                            <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-green-600 text-xs mt-1">
                              <MessageCircle size={14} /> تواصل عبر واتساب
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Coupons */}
          {adminTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-mareesh">الكوبونات ({adminCoupons.length})</h2>
                <Button onClick={() => { setEditCoupon({ code: '', type: 'percentage', value: 0, minOrder: null, maxDiscount: null, usageLimit: null, isActive: true }); setShowCouponModal(true); }} className="bg-mareesh text-white h-9">
                  <Plus size={16} className="ml-1" /> إضافة كوبون
                </Button>
              </div>
              {adminCoupons.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Tags size={48} className="mx-auto mb-4 opacity-30" />
                    <p>لا توجد كوبونات</p>
                    <p className="text-sm mt-1">أضف كوبونات خصم لجذب العملاء</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الكود</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">القيمة</TableHead>
                            <TableHead className="text-right">الحد الأدنى</TableHead>
                            <TableHead className="text-right">الاستخدام</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الصلاحية</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminCoupons.map((coupon: any) => (
                            <TableRow key={coupon.id}>
                              <TableCell className="font-mono font-bold text-mareesh">{coupon.code}</TableCell>
                              <TableCell className="text-sm">{coupon.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}</TableCell>
                              <TableCell className="text-sm font-bold">{coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}</TableCell>
                              <TableCell className="text-sm">{coupon.minOrder ? formatPrice(coupon.minOrder) : '-'}</TableCell>
                              <TableCell className="text-sm">{coupon.usedCount}/{coupon.usageLimit || '∞'}</TableCell>
                              <TableCell><Badge className={coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{coupon.isActive ? 'مفعّل' : 'معطّل'}</Badge></TableCell>
                              <TableCell className="text-xs text-muted-foreground">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ar-YE') : 'بدون انتهاء'}</TableCell>
                              <TableCell className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCoupon(coupon); setShowCouponModal(true); }}><Edit size={14} /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={async () => { await fetch(`/api/coupons/all?id=${coupon.id}`, { method: 'DELETE' }); fetchAdminData(); }}><Trash2 size={14} /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="md:hidden divide-y">
                      {adminCoupons.map((coupon: any) => (
                        <div key={coupon.id} className="p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-mareesh">{coupon.code}</span>
                            <Badge className={coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{coupon.isActive ? 'مفعّل' : 'معطّل'}</Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-bold">{coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}</span>
                            <span className="text-muted-foreground"> • {coupon.type === 'percentage' ? 'نسبة' : 'ثابت'} • استخدام: {coupon.usedCount}/{coupon.usageLimit || '∞'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Settings */}
          {adminTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-mareesh">الإعدادات</h2>
              <Card>
                <CardHeader><CardTitle>إعدادات المتجر</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>اسم المتجر</Label><Input value={settingsForm.store_name || ''} onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })} /></div>
                    <div><Label>البريد الإلكتروني</Label><Input value={settingsForm.store_email || ''} onChange={(e) => setSettingsForm({ ...settingsForm, store_email: e.target.value })} /></div>
                    <div><Label>رقم الهاتف</Label><Input value={settingsForm.store_phone || ''} onChange={(e) => setSettingsForm({ ...settingsForm, store_phone: e.target.value })} /></div>
                    <div><Label>تكلفة الشحن</Label><Input type="number" value={settingsForm.shipping_cost || ''} onChange={(e) => setSettingsForm({ ...settingsForm, shipping_cost: e.target.value })} /></div>
                    <div><Label>حد الشحن المجاني</Label><Input type="number" value={settingsForm.free_shipping_threshold || ''} onChange={(e) => setSettingsForm({ ...settingsForm, free_shipping_threshold: e.target.value })} /></div>
                  </div>
                  <Button onClick={saveSettings} className="bg-mareesh hover:bg-mareesh-dark">حفظ الإعدادات</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    );
  };

  /* ─── IMAGE UPLOAD HANDLER ─── */
  const handleImageUpload = async (file: File, slot: string) => {
    if (!file) return;
    setUploadingImage(slot);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) { showNotification(data.error, 'error'); return; }
      const currentImages = safeJsonParse(editProduct?.images);
      // Ensure we have 5 slots
      while (currentImages.length < 5) currentImages.push('');
      const slotIndex: Record<string, number> = { main: 0, angle1: 1, angle2: 2, reality1: 3, reality2: 4 };
      currentImages[slotIndex[slot]] = data.url;
      setEditProduct({ ...editProduct!, images: JSON.stringify(currentImages) });
      showNotification('تم رفع الصورة بنجاح', 'success');
    } catch { showNotification('خطأ في رفع الصورة', 'error'); }
    finally { setUploadingImage(null); }
  };

  const removeImage = (slot: string) => {
    const currentImages = safeJsonParse(editProduct?.images);
    while (currentImages.length < 5) currentImages.push('');
    const slotIndex: Record<string, number> = { main: 0, angle1: 1, angle2: 2, reality1: 3, reality2: 4 };
    currentImages[slotIndex[slot]] = '';
    setEditProduct({ ...editProduct!, images: JSON.stringify(currentImages) });
  };

  /* ─── ADMIN PRODUCT MODAL ─── */
  const ProductModal = () => {
    const currentImages = safeJsonParse(editProduct?.images);
    while (currentImages.length < 5) currentImages.push('');
    const imageSlots = [
      { key: 'main', label: 'الصورة الرئيسية', icon: '📸', required: true },
      { key: 'angle1', label: 'صورة من اتجاه مختلف ١', icon: '🔄', required: false },
      { key: 'angle2', label: 'صورة من اتجاه مختلف ٢', icon: '🔄', required: false },
      { key: 'reality1', label: 'صورة على الواقع ١', icon: '🌟', required: false },
      { key: 'reality2', label: 'صورة على الواقع ٢', icon: '🌟', required: false },
    ];
    const slotIndex: Record<string, number> = { main: 0, angle1: 1, angle2: 2, reality1: 3, reality2: 4 };

    return (
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct?.id ? 'تعديل منتج' : 'إضافة منتج'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>الاسم بالعربي</Label><Input value={editProduct?.name || ''} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} /></div>
              <div><Label>الاسم بالإنجليزي</Label><Input value={editProduct?.nameEn || ''} onChange={(e) => setEditProduct({ ...editProduct, nameEn: e.target.value })} /></div>
            </div>
            <div><Label>الوصف</Label><Textarea value={editProduct?.description || ''} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>السعر (ر.ي) *</Label><Input type="number" value={editProduct?.price || 0} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} placeholder="سعر البيع" /></div>
              <div><Label>السعر قبل الخصم (ر.ي)</Label><Input type="number" value={editProduct?.comparePrice || ''} onChange={(e) => setEditProduct({ ...editProduct, comparePrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="اتركه فارغ = بدون خصم" /></div>
              <div><Label>المخزون</Label><Input type="number" value={editProduct?.stock || 0} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>SKU</Label><Input value={editProduct?.sku || ''} onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })} /></div>
              <div>
                <Label>الفئة</Label>
                <Select value={editProduct?.categoryId || ''} onValueChange={(v) => setEditProduct({ ...editProduct, categoryId: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-mareesh">صور المنتج</Label>
              
              {/* Main Image */}
              <div className="border-2 border-dashed border-mareesh/30 rounded-xl p-3">
                <p className="text-sm font-medium mb-2">{imageSlots[0].icon} {imageSlots[0].label} *</p>
                <div className="flex items-center gap-3">
                  {currentImages[0] ? (
                    <div className="relative w-24 h-28 rounded-lg overflow-hidden border-2 border-mareesh">
                      <img src={currentImages[0]} alt="الصورة الرئيسية" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage('main')} className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"><X size={12} /></button>
                    </div>
                  ) : (
                    <label className={`w-24 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-mareesh/50 transition-colors ${uploadingImage === 'main' ? 'opacity-50' : ''}`}>
                      <Plus size={20} className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">رفع صورة</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'main')} disabled={uploadingImage === 'main'} />
                    </label>
                  )}
                  {uploadingImage === 'main' && <span className="text-xs text-mareesh animate-pulse">جاري الرفع...</span>}
                </div>
              </div>

              {/* Angle Images */}
              <div className="border border-gold/30 rounded-xl p-3">
                <p className="text-sm font-medium mb-2">🔄 صور من اتجاهات مختلفة</p>
                <div className="flex gap-3 flex-wrap">
                  {[1, 2].map((n) => {
                    const key = `angle${n}`;
                    const idx = slotIndex[key];
                    return (
                      <div key={key}>
                        {currentImages[idx] ? (
                          <div className="relative w-24 h-28 rounded-lg overflow-hidden border border-gold/50">
                            <img src={currentImages[idx]} alt={`اتجاه ${n}`} className="w-full h-full object-cover" />
                            <button onClick={() => removeImage(key)} className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"><X size={10} /></button>
                          </div>
                        ) : (
                          <label className={`w-24 h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors ${uploadingImage === key ? 'opacity-50' : ''}`}>
                            <Plus size={18} className="text-gray-300" />
                            <span className="text-xs text-gray-300 mt-1">اتجاه {n}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], key)} disabled={uploadingImage === key} />
                          </label>
                        )}
                        {uploadingImage === key && <span className="text-xs text-gold animate-pulse block text-center mt-1">جاري الرفع...</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reality Images */}
              <div className="border border-emerald-300/30 rounded-xl p-3">
                <p className="text-sm font-medium mb-2">🌟 صور على الواقع</p>
                <div className="flex gap-3 flex-wrap">
                  {[1, 2].map((n) => {
                    const key = `reality${n}`;
                    const idx = slotIndex[key];
                    return (
                      <div key={key}>
                        {currentImages[idx] ? (
                          <div className="relative w-24 h-28 rounded-lg overflow-hidden border border-emerald-300/50">
                            <img src={currentImages[idx]} alt={`واقع ${n}`} className="w-full h-full object-cover" />
                            <button onClick={() => removeImage(key)} className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"><X size={10} /></button>
                          </div>
                        ) : (
                          <label className={`w-24 h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-300/50 transition-colors ${uploadingImage === key ? 'opacity-50' : ''}`}>
                            <Plus size={18} className="text-gray-300" />
                            <span className="text-xs text-gray-300 mt-1">واقع {n}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], key)} disabled={uploadingImage === key} />
                          </label>
                        )}
                        {uploadingImage === key && <span className="text-xs text-emerald-500 animate-pulse block text-center mt-1">جاري الرفع...</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>المقاسات (مثل: S,M,L,XL)</Label><Input value={editProduct?.sizes || '[]'} onChange={(e) => setEditProduct({ ...editProduct, sizes: e.target.value })} placeholder='["S","M","L","XL"]' /></div>
              <div><Label>الألوان (JSON)</Label><Input value={editProduct?.colors || '[]'} onChange={(e) => setEditProduct({ ...editProduct, colors: e.target.value })} placeholder='[{"name":"أحمر","hex":"#FF0000"}]' /></div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editProduct?.isFeatured || false} onChange={(e) => setEditProduct({ ...editProduct, isFeatured: e.target.checked })} /> مميز
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editProduct?.isNew || false} onChange={(e) => setEditProduct({ ...editProduct, isNew: e.target.checked })} /> جديد
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editProduct?.isBestseller || false} onChange={(e) => setEditProduct({ ...editProduct, isBestseller: e.target.checked })} /> الأكثر مبيعاً
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>إلغاء</Button>
            <Button onClick={saveProduct} className="bg-mareesh">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  /* ─── ADMIN CATEGORY MODAL ─── */
  const CategoryModal = () => (
    <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editCategory?.id ? 'تعديل فئة' : 'إضافة فئة'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>الاسم بالعربي</Label><Input value={editCategory?.name || ''} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} /></div>
            <div><Label>الاسم بالإنجليزي</Label><Input value={editCategory?.nameEn || ''} onChange={(e) => setEditCategory({ ...editCategory, nameEn: e.target.value })} /></div>
          </div>
          <div><Label>الرابط (Slug)</Label><Input value={editCategory?.slug || ''} onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })} /></div>
          <div><Label>الوصف</Label><Textarea value={editCategory?.description || ''} onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })} /></div>
          <div><Label>الترتيب</Label><Input type="number" value={editCategory?.sortOrder || 0} onChange={(e) => setEditCategory({ ...editCategory, sortOrder: Number(e.target.value) })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCategoryModal(false)}>إلغاء</Button>
          <Button onClick={saveCategory} className="bg-mareesh">حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  /* ─── COUPON MODAL ─── */
  const CouponModal = () => (
    <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editCoupon?.id ? 'تعديل كوبون' : 'إضافة كوبون'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>كود الخصم *</Label><Input value={editCoupon?.code || ''} onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value.toUpperCase() })} placeholder="SAVE20" className="font-mono" /></div>
            <div><Label>النوع</Label>
              <Select value={editCoupon?.type || 'percentage'} onValueChange={(v) => setEditCoupon({ ...editCoupon, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت (ر.ي)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>القيمة *</Label><Input type="number" value={editCoupon?.value || ''} onChange={(e) => setEditCoupon({ ...editCoupon, value: Number(e.target.value) })} placeholder={editCoupon?.type === 'percentage' ? '20' : '500'} /></div>
            <div><Label>الحد الأدنى للطلب</Label><Input type="number" value={editCoupon?.minOrder || ''} onChange={(e) => setEditCoupon({ ...editCoupon, minOrder: e.target.value ? Number(e.target.value) : null })} placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>الحد الأقصى للخصم</Label><Input type="number" value={editCoupon?.maxDiscount || ''} onChange={(e) => setEditCoupon({ ...editCoupon, maxDiscount: e.target.value ? Number(e.target.value) : null })} placeholder="بدون حد" /></div>
            <div><Label>حد الاستخدام</Label><Input type="number" value={editCoupon?.usageLimit || ''} onChange={(e) => setEditCoupon({ ...editCoupon, usageLimit: e.target.value ? Number(e.target.value) : null })} placeholder="بدون حد" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>تاريخ البداية</Label><Input type="date" value={editCoupon?.startsAt ? new Date(editCoupon.startsAt).toISOString().split('T')[0] : ''} onChange={(e) => setEditCoupon({ ...editCoupon, startsAt: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
            <div><Label>تاريخ الانتهاء</Label><Input type="date" value={editCoupon?.expiresAt ? new Date(editCoupon.expiresAt).toISOString().split('T')[0] : ''} onChange={(e) => setEditCoupon({ ...editCoupon, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editCoupon?.isActive !== false} onChange={(e) => setEditCoupon({ ...editCoupon, isActive: e.target.checked })} className="rounded" />
            <Label>مفعّل</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCouponModal(false)}>إلغاء</Button>
          <Button onClick={async () => {
            if (!editCoupon?.code || !editCoupon?.value) { showNotification('يرجى ملء الكود والقيمة', 'error'); return; }
            try {
              const method = editCoupon.id ? 'PUT' : 'POST';
              const res = await fetch('/api/coupons/all', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editCoupon) });
              if (res.ok) {
                showNotification(editCoupon.id ? 'تم تحديث الكوبون' : 'تم إضافة الكوبون', 'success');
                setShowCouponModal(false);
                fetchAdminData();
              } else {
                const data = await res.json();
                showNotification(data.error || 'خطأ في حفظ الكوبون', 'error');
              }
            } catch { showNotification('خطأ في حفظ الكوبون', 'error'); }
          }} className="bg-mareesh">حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  /* ─── ORDER DETAIL MODAL (removed - now using page view) ─── */

  /* ════════════════════════════════════════════════════════════════
     FOOTER
  ════════════════════════════════════════════════════════════════ */
  const Footer = () => (
    <footer className="bg-mareesh-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center"><ShoppingBag size={20} className="text-white" /></div>
              <div><div className="font-bold text-lg">المريش شوب</div><div className="text-xs text-gold">AL-MAREESH SHOP</div></div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">متجرك المفضل لملابس الأطفال والنسائية والأحذية بأسعار مميزة وجودة عالية.</p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: <Send size={16} />, label: 'تلجرام', href: 'https://t.me/almorishshop', color: 'hover:bg-[#0088cc]' },
                { icon: <MessageCircle size={16} />, label: 'واتساب', href: 'https://wa.me/967776792012', color: 'hover:bg-[#25D366]' },
                { icon: <MessageCircle size={16} />, label: 'قناة واتساب', href: 'https://whatsapp.com/channel/0029VbCe7YL2ER6fSWLU0S1k', color: 'hover:bg-[#25D366]' },
                { icon: <Instagram size={16} />, label: 'انستقرام', href: '#', color: 'hover:bg-[#E1306C]' },
                { icon: <Facebook size={16} />, label: 'فيسبوك', href: '#', color: 'hover:bg-[#1877F2]' },
              ].map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer"
                  className={`w-9 h-9 bg-mareesh rounded-lg flex items-center justify-center ${social.color} hover:text-white transition-all`} title={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-gold">روابط سريعة</h4>
            <div className="space-y-2">
              {[
                { label: 'الرئيسية', action: goToHome },
                { label: 'المتجر', action: () => goToShop() },
                { label: 'العروض المميزة', action: () => goToShop() },
                { label: 'تواصل معنا', action: () => setView('contact') },
                { label: 'تتبع الطلب', action: () => setShowTrackModal(true) },
                { label: 'طلب منتج غير موجود', action: () => setShowRequestModal(true) },
              ].map((link, idx) => (
                <button key={idx} onClick={link.action} className="block text-sm text-white/70 hover:text-gold transition-colors">{link.label}</button>
              ))}
            </div>
          </div>
          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-gold">الأقسام</h4>
            <div className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <button key={cat.id} onClick={() => goToShop(cat.slug)} className="block text-sm text-white/70 hover:text-gold transition-colors">{cat.name}</button>
              ))}
            </div>
          </div>
          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4 text-gold">خدمة العملاء</h4>
            <div className="space-y-2">
              {[
                { label: 'سياسة الاسترجاع', action: () => setShowTrackModal(true) },
                { label: 'الأسئلة الشائعة', action: () => setView('contact') },
                { label: 'الشروط والأحكام', action: () => {} },
                { label: 'سياسة الخصوصية', action: () => {} },
              ].map((link, idx) => (
                <button key={idx} onClick={link.action} className="block text-sm text-white/70 hover:text-gold transition-colors">{link.label}</button>
              ))}
            </div>
            {/* App Download */}
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gold mb-2">حمّل تطبيقنا</h5>
              <div className="flex flex-col gap-2">
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-mareesh hover:bg-mareesh-light rounded-lg p-2 transition-colors">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-xl">▶</div>
                  <div className="text-xs">
                    <div className="text-white/50">GET IT ON</div>
                    <div className="font-medium">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-gold">تواصل معنا</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/70"><Phone size={14} className="text-gold shrink-0" /> {settings.store_phone || '+967776792012'}</div>
              <div className="flex items-center gap-2 text-sm text-white/70"><Mail size={14} className="text-gold shrink-0" /> {settings.store_email || 'info@mareesh.com'}</div>
              <div className="flex items-center gap-2 text-sm text-white/70"><MapPin size={14} className="text-gold shrink-0" /> اليمن</div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-mareesh-light">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/50">© 2025 المريش شوب. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span>سياسة الخصوصية</span>
            <span>الشروط والأحكام</span>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ════════════════════════════════════════════════════════════════
     MAIN RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-cream" dir="rtl">
      {/* Notification inline */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-xl animate-fade-in ${
          notification.type === 'success' ? 'bg-green-600 text-white' :
          notification.type === 'error' ? 'bg-red-600 text-white' :
          'bg-mareesh text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <Check size={18} />}
            {notification.type === 'error' && <AlertCircle size={18} />}
            {notification.type === 'info' && <AlertCircle size={18} />}
            <span className="text-sm font-medium">{notification.message}</span>
            <button onClick={clearNotification} className="mr-2 opacity-70 hover:opacity-100"><X size={16} /></button>
          </div>
        </div>
      )}
      {AuthModal()}
      {ProductModal()}
      {CategoryModal()}
      {CouponModal()}

      {Header()}

      <main className="flex-1">
        {view === 'home' && HomeView()}
        {view === 'shop' && ShopView()}
        {view === 'product' && ProductDetailView()}
        {view === 'cart' && CartView()}
        {view === 'checkout' && CheckoutView()}
        {view === 'admin' && AdminView()}
        {view === 'contact' && ContactView()}
      </main>

      {view !== 'admin' && Footer()}

      {/* أزرار التواصل العائمة + شات ذكي + طلب منتج */}
      {view !== 'admin' && (
        <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50">
          {/* AI Chat */}
          <button onClick={() => setShowAiChat(!showAiChat)}
            className="w-14 h-14 bg-gradient-to-br from-gold to-gold-light text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" title="شات ذكي">
            <Sparkles size={28} />
          </button>
          <a href="https://wa.me/967776792012" target="_blank" rel="noopener noreferrer"
            className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" title="تواصل عبر واتساب">
            <MessageCircle size={28} />
          </a>
          <a href="https://t.me/almorishshop" target="_blank" rel="noopener noreferrer"
            className="w-14 h-14 bg-[#0088cc] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" title="تواصل عبر تلجرام">
            <Send size={28} />
          </a>
        </div>
      )}

      {/* AI Chat Window */}
      {showAiChat && (
        <div className="fixed bottom-24 left-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-mareesh/20 z-50 overflow-hidden animate-fade-in" dir="rtl">
          <div className="bg-gradient-to-l from-mareesh to-mareesh-light text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <div>
                <div className="font-bold text-sm">مساعد المريش الذكي</div>
                <div className="text-xs text-white/70">متصل الآن</div>
              </div>
            </div>
            <button onClick={() => setShowAiChat(false)} className="text-white/70 hover:text-white"><X size={18} /></button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-3 bg-cream/30">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-mareesh text-white rounded-br-sm' 
                    : 'bg-white border border-gold/20 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <Input value={aiInput} onChange={(e) => setAiInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
              placeholder="اكتب رسالتك..." className="h-9 text-sm" />
            <Button onClick={handleAiChat} size="icon" className="h-9 w-9 bg-mareesh shrink-0"><Send size={14} /></Button>
          </div>
        </div>
      )}

      {/* Request Product Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Package size={20} className="text-mareesh" /> طلب منتج غير موجود</DialogTitle>
            <DialogDescription>إذا لم تجد المنتج الذي تبحث عنه، صفه لنا وسنحاول توفيره لك!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground bg-amber-50 p-2 rounded-lg">يمكنك إرفاق الطلب من: علي إكسبريس، نون، تيمو، زارا، أمازون، أو أي متجر آخر.</p>
            <div><Label>اسم المنتج *</Label><Input value={requestForm.name} onChange={(e) => setRequestForm({...requestForm, name: e.target.value})} placeholder="اسم المنتج المطلوب" /></div>
            <div><Label>وصف المنتج</Label><Textarea value={requestForm.description} onChange={(e) => setRequestForm({...requestForm, description: e.target.value})} placeholder="وصف المنتج بالتفصيل..." className="resize-none h-20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>الفئة</Label>
                <Select value={requestForm.category} onValueChange={(v) => setRequestForm({...requestForm, category: v})}>
                  <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>السعر المتوقع (ر.ي)</Label><Input type="number" value={requestForm.expectedPrice} onChange={(e) => setRequestForm({...requestForm, expectedPrice: e.target.value})} placeholder="0" /></div>
            </div>
            <div><Label>رابط المنتج</Label><Input value={requestForm.link} onChange={(e) => setRequestForm({...requestForm, link: e.target.value})} placeholder="رابط من أي متجر آخر" dir="ltr" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>إلغاء</Button>
            <Button onClick={handleRequestProduct} className="bg-mareesh">إرسال الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Order Modal */}
      <Dialog open={showTrackModal} onOpenChange={setShowTrackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Truck size={20} className="text-mareesh" /> تتبع الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={trackOrderNumber} onChange={(e) => setTrackOrderNumber(e.target.value)} placeholder="رقم الطلب (مثل: ORD-12345)" />
              <Button onClick={handleTrackOrder} className="bg-mareesh shrink-0">بحث</Button>
            </div>
            {trackResult && (
              <Card className="border-mareesh/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-mareesh">{trackResult.orderNumber}</span>
                    <Badge className={statusColors[trackResult.status] || 'bg-gray-100 text-gray-800'}>{statusMap[trackResult.status] || trackResult.status}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي:</span><span className="font-medium">{formatPrice(trackResult.total)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">طريقة الدفع:</span><span>{trackResult.paymentMethod === 'karimi' ? 'كريمي' : trackResult.paymentMethod === 'qataybi' ? 'قطيبي' : trackResult.paymentMethod === 'jeeb' ? 'جيب' : 'عند الاستلام'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">التاريخ:</span><span>{new Date(trackResult.createdAt).toLocaleDateString('ar-YE')}</span></div>
                  </div>
                  {/* Status Steps */}
                  <div className="mt-4 space-y-2" dir="ltr">
                    {['pending', 'processing', 'shipped', 'delivered'].map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          ['pending','processing','shipped','delivered'].indexOf(trackResult.status) >= i 
                            ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>{i + 1}</div>
                        <span className={`text-sm ${['pending','processing','shipped','delivered'].indexOf(trackResult.status) >= i ? 'font-medium' : 'text-muted-foreground'}`}>
                          {statusMap[s]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
