
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from './supabase';
import './App.css';

type Size = { label: string; price: number };

type Product = {
  id?: string;
  category: string;
  name: string;
  description?: string;
  price?: number;
  sizes?: Size[];
  tag?: string;
  section?: string;
  image_url?: string;
};

type CartItem = {
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

const cakeData: [string, number, number][] = [
  ['Pineapple', 350, 650],
  ['Mango', 350, 650],
  ['Strawberry', 350, 650],
  ['Butter Scotch', 380, 700],
  ['Litchi', 380, 700],
  ['Black Current', 380, 700],
  ['Irish Coffee', 380, 700],
  ['White Forest', 400, 750],
  ['Swiss Chocolate', 400, 750],
  ['Choco Strawberry', 400, 750],
  ['Black Forest', 400, 750],
  ['Blue Berry', 450, 850],
  ['Choco Dry Nuts', 450, 850],
  ['Choco Almond', 450, 850],
  ['Choco Truffle', 450, 850],
  ['Oreo Cake', 450, 850],
  ['Choco Chip Cake', 450, 850],
  ['Dutch Truffle', 450, 850],
  ['Death by Chocolate', 450, 850],
  ['Blueberry White Forest', 500, 900],
  ['Pista', 500, 900],
  ['German Chocolate', 500, 900],
  ['Fruit Slice Cake', 500, 900],
  ['Red Velvet', 500, 900],
  ['Choco Red Velvet', 550, 950],
  ['Kit Kat Cake', 500, 900],
  ['Rasmalai Cake', 550, 1000],
  ['Mango Rasmalai', 600, 1100],
  ['Gulab Jam Cake', 600, 1100],
  ['Rose Milk Cake', 600, 1100],
  ['Ferrero Rocher', 600, 1100],
];

const vegPizza: [string, number, number, number][] = [
  ['Classic Cheese Pizza', 110, 180, 250],
  ['Onion Pizza', 120, 190, 260],
  ['Tomato Pizza', 120, 190, 260],
  ['Capsicum Pizza', 130, 200, 280],
  ['Fresh Veggie Pizza', 140, 200, 280],
  ['Corn Feast Pizza', 150, 220, 310],
  ['Babycorn Pizza', 160, 240, 340],
  ['Spicy Feast Pizza', 170, 250, 350],
  ['Mushroom Feast Pizza', 180, 250, 350],
  ['Paneer Masala Pizza', 190, 270, 380],
  ['Chef Special Veg Pizza', 200, 310, 430],
];

const nonVegPizza: [string, number, number, number][] = [
  ['Garlic Chicken Pizza', 160, 210, 310],
  ['Peri Peri Chicken Pizza', 160, 210, 310],
  ['Corn Chicken Pizza', 170, 220, 330],
  ['Andhra Chicken Pizza', 190, 230, 340],
  ['Spicy Chicken Pizza', 190, 240, 350],
  ['Chicken Tikka Pizza', 200, 250, 370],
  ['Tandoori Chicken Pizza', 200, 280, 390],
  ['BBQ Chicken Pizza', 210, 280, 390],
  ['Chicken Keema Pizza', 220, 320, 440],
  ['Chef Special Non-Veg Pizza', 230, 350, 470],
];

const single = (
  category: string,
  section: string,
  tag: string,
  entries: [string, number][]
): Product[] =>
  entries.map(([name, price]) => ({
    category,
    section,
    tag: tag || undefined,
    name,
    price,
  }));

const sized = (
  category: string,
  section: string,
  tag: string,
  entries: [string, number, number, number][]
): Product[] =>
  entries.map(([name, small, medium, large]) => ({
    category,
    section,
    tag: tag || undefined,
    name,
    sizes: [
      { label: 'Small', price: small },
      { label: 'Medium', price: medium },
      { label: 'Large', price: large },
    ],
  }));

const menuItems: Product[] = [
  ...cakeData.map(([name, half, full]) => ({
    category: 'Cakes',
    name,
    sizes: [
      { label: '500 GM', price: half },
      { label: '1000 GM', price: full },
    ],
  })),

  ...sized('Pizza & Momos', 'Pizza', 'VEG', vegPizza),
  ...sized('Pizza & Momos', 'Pizza', 'NON-VEG', nonVegPizza),

  ...[
    {
      name: 'Extra Cheese',
      sizes: [
        { label: 'Small', price: 30 },
        { label: 'Medium', price: 60 },
        { label: 'Large', price: 90 },
      ],
    },
    {
      name: 'Cheese Burst',
      sizes: [
        { label: 'Small', price: 50 },
        { label: 'Medium', price: 100 },
        { label: 'Large', price: 150 },
      ],
    },
  ].map((item) => ({
    category: 'Pizza & Momos',
    section: 'Pizza Add-ons',
    ...item,
  })),

  ...[
    {
      name: 'Mix Veg Momos',
      tag: 'VEG',
      sizes: [
        { label: 'Steamed', price: 120 },
        { label: 'Oil Fried', price: 130 },
      ],
    },
    {
      name: 'Paneer Momos',
      tag: 'VEG',
      sizes: [
        { label: 'Steamed', price: 150 },
        { label: 'Oil Fried', price: 160 },
      ],
    },
    {
      name: 'Chicken Momos',
      tag: 'NON-VEG',
      sizes: [
        { label: 'Steamed', price: 140 },
        { label: 'Oil Fried', price: 150 },
      ],
    },
  ].map((item) => ({
    category: 'Pizza & Momos',
    section: 'Momos',
    ...item,
  })),

  ...single('Beverages', 'Cold Coffee', '', [
    ['Cold Coffee', 69],
    ['Chocolate Coffee', 80],
    ['Irish Coffee', 80],
    ['Chocolate Frappe Coffee', 120],
    ['Caramel Frappe Coffee', 150],
    ['Caramel Chocolate Frappe Coffee', 170],
  ]),

  ...single('Beverages', 'Coffee', '', [
    ['Hot Coffee', 69],
    ['Coffee Leto', 80],
    ['Caramel Coffee', 80],
    ['Chocolate Coffee', 100],
    ['Hot Chocolate', 100],
  ]),

  ...single('Beverages', 'Mocktails', '', [
    ['Virgin Mojito', 80],
    ['Blue Curacao', 90],
    ['Green Apple', 90],
    ['Strawberry', 90],
    ['Water Mellon', 90],
    ['Blueberry', 110],
  ]),

  ...single('Beverages', 'Milkshakes', '', [
    ['Vanilla', 80],
    ['Pineapple', 90],
    ['Pista', 110],
    ['Rose Milk', 110],
    ['Strawberry', 110],
    ['Black Currant', 110],
    ['Mango', 110],
    ['Blueberry', 120],
    ['Chocolate', 120],
    ['Kit Kat', 120],
    ['Oreo', 130],
  ]),

  ...single('Desserts', 'Desserts', '', [
    ['Carrot Cake', 70],
    ['Choco Lava Cake', 70],
    ['Donuts', 70],
    ['Chocolate Brownie', 90],
    ['Vennela Brownie', 100],
    ['Chocolate Brownie with Icecream', 140],
    ['Vennela Brownie with Icecream', 140],
    ['Sizzling Brownie', 200],
  ]),

  ...single('Fast Food', 'Burgers', 'VEG', [
    ['Aloo Burger', 90],
    ['Corn Burger', 100],
    ['Veg Loaded Burger', 120],
    ['Spicy Paneer Burger', 130],
    ['Chef Special Veg', 140],
  ]),

  ...single('Fast Food', 'Burgers', 'NON-VEG', [
    ['Premium Chicken Burger', 140],
    ['Grilled Chicken Burger', 160],
    ['Tandoori Chicken Burger', 180],
    ['Grill Mutton Burger', 220],
    ['Chef Special Non-Veg', 220],
  ]),

  ...single('Fast Food', 'Pasta', 'VEG', [
    ['White Sauce Pasta', 100],
    ['Creamy Sauce Pasta', 120],
    ['Red Sauce Pasta', 120],
    ['Italian Pasta', 150],
    ['Penne Arrabbiata', 160],
  ]),

  ...single('Fast Food', 'Pasta', 'NON-VEG', [
    ['White Chicken Pasta', 130],
    ['Butter Chicken Pasta', 140],
    ['Red Sauce Chicken Pasta', 150],
    ['Arrabbiata Chicken Pasta', 160],
    ['Italian Chicken Pasta', 180],
  ]),

  ...single('Fast Food', 'Garlic Bread', 'VEG', [
    ['Garlic Bread', 70],
    ['Cheese Garlic Bread', 90],
    ['Chilli Cheese Garlic Bread', 100],
    ['Corn Cheese Garlic Bread', 120],
    ['Stuffed Veg Garlic Bread', 150],
  ]),

  ...single('Fast Food', 'Garlic Bread', 'NON-VEG', [
    ['Chicken Cheese Garlic Bread', 100],
    ['Chilli Chicken Cheese Garlic Bread', 120],
    ['Corn N Chicken Cheese Garlic Bread', 140],
    ['Tandoori Chicken Cheese Garlic Bread', 150],
    ['Stuffed Chicken Cheese Garlic Bread', 200],
  ]),

  ...single('Fast Food', 'Sandwiches', 'VEG', [
    ['Grilled Sandwich', 69],
    ['Grilled Capsicum Sandwich', 79],
    ['Grilled Mix Veg Sandwich', 89],
    ['Grilled Corn Sandwich', 99],
    ['Grilled Paneer Sandwich', 100],
  ]),

  ...single('Fast Food', 'Sandwiches', 'NON-VEG', [
    ['Grilled Spicy Chicken Sandwich', 89],
    ['Grilled Tandoori Chicken Sandwich', 99],
    ['Garlic Chicken Sandwich', 99],
    ['Grilled CK Tikka Sandwich', 100],
    ['Grilled BBQ Sandwich', 120],
  ]),

  ...single('Fast Food', 'Rolls', 'VEG', [
    ['Veg Roll', 90],
    ['Mix Veg Roll', 120],
    ['Paneer Roll', 130],
    ['French Fries Roll', 130],
  ]),

  ...single('Fast Food', 'Rolls', 'NON-VEG', [
    ['Egg Roll', 90],
    ['Egg Chicken Roll', 140],
    ['Spicy Chicken Roll', 130],
    ['Tandoori Chicken Roll', 140],
    ['BBQ Chicken Roll', 140],
  ]),

  ...single('Fast Food', 'Snacks', 'VEG', [
    ['Crispy French Fries', 90],
    ['Pizza Sticks (6 Nos)', 100],
    ['Spicy Onion Rings (6 Nos)', 120],
    ['Cheese Corn Triangles (6 Nos)', 120],
    ['Pizza Pocket (3 Nos)', 120],
  ]),

  ...single('Fast Food', 'Snacks', 'NON-VEG', [
    ['Crunchy Chicken Nuggets (6 Nos)', 160],
    ['Chicken Strips (4 Nos)', 170],
    ['Garlic Chicken Fingers (6 Nos)', 170],
    ['Chicken Fries (6 Nos)', 170],
    ['Crispy Tenders Chicken (4 Nos)', 170],
  ]),
];

const categories = [
  {
    name: 'Cakes',
    key: 'Cakes',
    icon: '🎂',
    description: 'Celebration cakes & flavours',
  },
  {
    name: 'Pizzas',
    key: 'Pizza',
    icon: '🍕',
    description: 'Freshly baked pizzas',
  },
  {
    name: 'Momos',
    key: 'Momos',
    icon: '🥟',
    description: 'Steamed & fried momos',
  },
  {
    name: 'Cold Coffee',
    key: 'Cold Coffee',
    icon: '🧋',
    description: 'Chilled coffee creations',
  },
  {
    name: 'Coffee',
    key: 'Coffee',
    icon: '☕',
    description: 'Hot coffee & chocolate',
  },
  {
    name: 'Mocktails',
    key: 'Mocktails',
    icon: '🍹',
    description: 'Refreshing mocktails',
  },
  {
    name: 'Milkshakes',
    key: 'Milkshakes',
    icon: '🥤',
    description: 'Delicious creamy shakes',
  },
  {
    name: 'Desserts',
    key: 'Desserts',
    icon: '🍩',
    description: 'Brownies and sweet treats',
  },
  {
    name: 'Burgers',
    key: 'Burgers',
    icon: '🍔',
    description: 'Veg & non-veg burgers',
  },
  {
    name: 'Pasta',
    key: 'Pasta',
    icon: '🍝',
    description: 'Creamy and delicious pasta',
  },
  {
    name: 'Garlic Bread',
    key: 'Garlic Bread',
    icon: '🥖',
    description: 'Fresh cheesy garlic bread',
  },
  {
    name: 'Sandwiches',
    key: 'Sandwiches',
    icon: '🥪',
    description: 'Grilled sandwiches',
  },
  {
    name: 'Rolls',
    key: 'Rolls',
    icon: '🌯',
    description: 'Tasty veg & non-veg rolls',
  },
  {
    name: 'Snacks',
    key: 'Snacks',
    icon: '🍟',
    description: 'Quick bites and snacks',
  },
];

const sections = [
  'Cakes',
  'Pizza',
  'Momos',
  'Pizza Add-ons',
  'Cold Coffee',
  'Coffee',
  'Mocktails',
  'Milkshakes',
  'Desserts',
  'Burgers',
  'Pasta',
  'Garlic Bread',
  'Sandwiches',
  'Rolls',
  'Snacks',
];

function App() {
  const [databaseItems, setDatabaseItems] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderType, setOrderType] = useState('Delivery');

  const [houseBuilding, setHouseBuilding] = useState('');
  const [streetName, setStreetName] = useState('');
  const [areaLocality, setAreaLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Madanapalle');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const [orderInstructions, setOrderInstructions] = useState('');
  const [orderWhatsapp, setOrderWhatsapp] = useState('919390935986');

  const [cakeName, setCakeName] = useState('');
  const [cakeFlavour, setCakeFlavour] = useState('Black Forest');
  const [cakeWeight, setCakeWeight] = useState('1 KG');
  const [cakeQuantity, setCakeQuantity] = useState('1');
  const [cakeDesign, setCakeDesign] = useState('');
  const [cakeColour, setCakeColour] = useState('');
  const [cakeMessage, setCakeMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('919390935986');

  const minimumDeliveryFee = 30;
  const maximumDeliveryFee = 50;

  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, category, description, price, sizes, tag, section, image_url'
        )
        .eq('available', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Could not load Chef Cakes products:', error.message);
        return;
      }

      if (!isMounted) return;

      const productsFromDatabase: Product[] = (data ?? []).map((item) => {
        const productSizes = Array.isArray(item.sizes) ? item.sizes : [];

        return {
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description ?? '',
          price: item.price ?? undefined,
          sizes: productSizes.length > 0 ? (productSizes as Size[]) : undefined,
          tag: item.tag ?? undefined,
          section: item.section ?? undefined,
          image_url: item.image_url ?? undefined,
        };
      });

      setDatabaseItems(productsFromDatabase);
    }

    loadDatabaseProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const productMap = new Map<string, Product>();

  [...menuItems, ...databaseItems].forEach((item) => {
    const key = `${item.category.toLowerCase()}-${item.name.toLowerCase()}`;
    const existing = productMap.get(key);

    productMap.set(key, {
      ...existing,
      ...item,
      image_url: item.image_url || existing?.image_url,
    });
  });

  const allMenuItems = Array.from(productMap.values());

  const filteredItems =
    activeCategory === 'All'
      ? allMenuItems
      : allMenuItems.filter((item) => {
          if (activeCategory === 'Cakes') {
            return item.category === 'Cakes';
          }

          if (activeCategory === 'Pizza') {
            return (
              item.section === 'Pizza' ||
              item.section === 'Pizza Add-ons'
            );
          }

          return item.section === activeCategory;
        });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const minimumOrderTotal = cartTotal + minimumDeliveryFee;
  const maximumOrderTotal = cartTotal + maximumDeliveryFee;

  function addToCart(name: string, variant: string, price: number) {
    setCart((current) => {
      const found = current.find(
        (item) => item.name === name && item.variant === variant
      );

      if (found) {
        return current.map((item) =>
          item.name === name && item.variant === variant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { name, variant, price, quantity: 1 }];
    });
  }

  function changeQuantity(name: string, variant: string, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.name === name && item.variant === variant
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Save the order in Supabase, then open WhatsApp.
  async function handleCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedPhone = orderPhone.replace(/\D/g, '');

    if (cleanedPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (
      orderType === 'Delivery' &&
      (!houseBuilding.trim() ||
        !streetName.trim() ||
        !areaLocality.trim() ||
        !landmark.trim() ||
        !deliveryCity.trim() ||
        !/^\d{6}$/.test(deliveryPincode))
    ) {
      alert(
        'Please complete all required delivery address fields and enter a valid 6-digit PIN code.'
      );
      return;
    }

    const fullDeliveryAddress =
      orderType === 'Delivery'
        ? `House / Building: ${houseBuilding.trim()}
Street: ${streetName.trim()}
Area / Locality: ${areaLocality.trim()}
Landmark: ${landmark.trim()}
City: ${deliveryCity.trim()}
PIN Code: ${deliveryPincode}
Additional Delivery Instructions: ${deliveryInstructions.trim() || 'None'}`
        : null;

    const minDelivery = orderType === 'Delivery' ? minimumDeliveryFee : 0;
    const maxDelivery = orderType === 'Delivery' ? maximumDeliveryFee : 0;

    const savedItems = cart.map((item) => ({
      name: item.name,
      variant: item.variant,
      price: item.price,
      quantity: item.quantity,
      line_total: item.price * item.quantity,
    }));

    // Open a blank tab immediately to avoid browser popup blocking.
    const whatsappWindow = window.open('about:blank', '_blank');

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: orderName.trim(),
          customer_phone: cleanedPhone,
          order_type: orderType,
          delivery_address: fullDeliveryAddress,
          items: savedItems,
          subtotal: cartTotal,
          delivery_charge: orderType === 'Delivery' ? null : 0,
          delivery_charge_min: minDelivery,
          delivery_charge_max: maxDelivery,
          estimated_total_min: cartTotal + minDelivery,
          estimated_total_max: cartTotal + maxDelivery,
          total: cartTotal,
          special_instructions:
            [
              orderInstructions.trim(),
              deliveryInstructions.trim()
                ? `Delivery instructions: ${deliveryInstructions.trim()}`
                : '',
            ]
              .filter(Boolean)
              .join('\n') || null,
          status: 'Pending',
        })
        .select('id')
        .single();

      if (error || !data) {
        console.error('Order saving failed:', error);
        whatsappWindow?.close();
        alert(
          'Your order could not be saved. Please try again. If the problem continues, contact Chef Cakes.'
        );
        return;
      }

      const orderItemsText = cart.map(
        (item) =>
          `${item.name} (${item.variant}) x ${item.quantity} = ₹${
            item.price * item.quantity
          }`
      );

      const deliveryCharge =
        orderType === 'Delivery'
          ? '₹30–₹50 (based on distance)'
          : '₹0 (Shop Pickup)';

      const estimatedTotal =
        orderType === 'Delivery'
          ? `₹${cartTotal + minimumDeliveryFee}–₹${
              cartTotal + maximumDeliveryFee
            }`
          : `₹${cartTotal}`;

      const message = `
CHEF CAKES - NEW ORDER

Order ID: ${data.id}
Order Status: Pending

Customer Name: ${orderName.trim()}
Phone Number: ${cleanedPhone}
Order Type: ${orderType}

ORDER DETAILS:
${orderItemsText.join('\n')}

Items Subtotal: ₹${cartTotal}
Delivery Charge: ${deliveryCharge}
Estimated Total: ${estimatedTotal}

${
  orderType === 'Delivery'
    ? `DELIVERY ADDRESS:
${fullDeliveryAddress}`
    : 'Customer will collect the order from the shop.'
}

Special Instructions: ${orderInstructions.trim() || 'None'}

Please confirm the exact delivery charge and final order total based on the delivery distance.
      `.trim();

      const whatsappURL = `https://wa.me/${orderWhatsapp}?text=${encodeURIComponent(
        message
      )}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappURL;
      } else {
        window.location.href = whatsappURL;
      }
    } catch (error) {
      console.error('Unexpected order error:', error);
      whatsappWindow?.close();
      alert(
        'Something went wrong while placing your order. Please try again.'
      );
    }
  }

  async function handleCustomSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedPhone = customerPhone.replace(/\D/g, '');

    if (cleanedPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const message = `
CHEF CAKES - CUSTOM CAKE ENQUIRY

Customer Name: ${cakeName}
Phone Number: ${cleanedPhone}
Cake Flavour: ${cakeFlavour}
Cake Weight: ${cakeWeight}
Quantity: ${cakeQuantity}
Design Requirements: ${cakeDesign}
Preferred Colours: ${cakeColour || 'Not specified'}
Cake Message: ${cakeMessage || 'No message'}
Delivery Date: ${deliveryDate}

Please review my requirements and share the quotation.
    `.trim();

    if (referenceImage) {
      try {
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [referenceImage] })
        ) {
          await navigator.share({
            title: 'Chef Cakes Custom Cake Enquiry',
            text: message,
            files: [referenceImage],
          });
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      }

      const fallbackMessage =
        message +
        '\n\nI have selected a cake reference image. I will attach it manually in WhatsApp.';

      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        fallbackMessage
      )}`;

      window.open(whatsappURL, '_blank', 'noopener,noreferrer');
      return;
    }

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
  }

  const today = new Date();

  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split('T')[0];

  return (
    <div className="website">
      <header className="navbar">
        <a className="brand" href="#home">
          CHEF CAKES
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#menu">Our Menu</a>
          <a href="#custom">Custom Cakes</a>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="cart-icon-button"
          onClick={() => setIsCartOpen(!isCartOpen)}
          aria-label="Open cart"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      {/* CART POPUP */}
      {isCartOpen && (
        <div className="cart-popup">
          <div className="cart-popup-header">
            <h2>YOUR CART</h2>
            <button onClick={() => setIsCartOpen(false)}>✕</button>
          </div>

          {cart.length === 0 ? (
            <p className="empty-cart">
              Your cart is empty. Add something delicious!
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  className="cart-popup-item"
                  key={`${item.name}-${item.variant}`}
                >
                  <div className="cart-item-name">
                    <strong>{item.name}</strong>
                    <small>
                      {item.variant} · ₹{item.price} each
                    </small>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        changeQuantity(item.name, item.variant, -1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item.name, item.variant, 1)}
                    >
                      +
                    </button>
                  </div>

                  <strong className="item-total">
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}

              <div className="cart-popup-total">
                <span>TOTAL</span>
                <strong>₹{cartTotal}</strong>
              </div>

              <button
                className="checkout-button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                PROCEED TO CHECKOUT →
              </button>

              <p className="cart-note">
                Review your order and send it to Chef Cakes through WhatsApp.
              </p>
            </>
          )}
        </div>
      )}

      {/* CHECKOUT POPUP */}
      {isCheckoutOpen && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <div className="checkout-header">
              <h2>CHECKOUT</h2>
              <button type="button" onClick={() => setIsCheckoutOpen(false)}>
                ✕
              </button>
            </div>

            <h3>YOUR ORDER</h3>

            {cart.map((item) => (
              <div
                className="checkout-item"
                key={`${item.name}-${item.variant}`}
              >
                <span>
                  {item.name} ({item.variant}) × {item.quantity}
                </span>
                <strong>₹{item.price * item.quantity}</strong>
              </div>
            ))}

            <div className="checkout-total">
              <span>ITEMS TOTAL</span>
              <strong>₹{cartTotal}</strong>
            </div>

            {orderType === 'Delivery' && (
              <>
                <div className="checkout-total">
                  <span>DELIVERY CHARGE</span>
                  <strong>₹30–₹50</strong>
                </div>

                <div className="checkout-total">
                  <span>ESTIMATED GRAND TOTAL</span>
                  <strong>
                    ₹{minimumOrderTotal}–₹{maximumOrderTotal}
                  </strong>
                </div>
              </>
            )}

            {orderType === 'Takeaway' && (
              <div className="checkout-total">
                <span>GRAND TOTAL</span>
                <strong>₹{cartTotal}</strong>
              </div>
            )}

            <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
              <label htmlFor="order-name">Your Name *</label>
              <input
                id="order-name"
                type="text"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                placeholder="Enter your name"
                required
              />

              <label htmlFor="order-phone">Phone Number *</label>
              <input
                id="order-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                pattern="[0-9]{10}"
                value={orderPhone}
                onChange={(e) =>
                  setOrderPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="Enter 10-digit mobile number"
                required
              />

              <label htmlFor="order-type">Delivery or Pickup *</label>
              <select
                id="order-type"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="Delivery">Home Delivery</option>
                <option value="Takeaway">Shop Pickup</option>
              </select>

              {orderType === 'Delivery' && (
                <>
                  <label htmlFor="house-building">
                    House / Building Name or Number *
                  </label>
                  <input
                    id="house-building"
                    type="text"
                    value={houseBuilding}
                    onChange={(e) => setHouseBuilding(e.target.value)}
                    placeholder="Example: H.No. 12-3, ABC Apartments"
                    required
                  />

                  <label htmlFor="street-name">Street Name *</label>
                  <input
                    id="street-name"
                    type="text"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    placeholder="Enter street name"
                    required
                  />

                  <label htmlFor="area-locality">Area / Locality *</label>
                  <input
                    id="area-locality"
                    type="text"
                    value={areaLocality}
                    onChange={(e) => setAreaLocality(e.target.value)}
                    placeholder="Enter your area or locality"
                    required
                  />

                  <label htmlFor="landmark">Nearby Landmark *</label>
                  <input
                    id="landmark"
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Example: Near bus stand"
                    required
                  />

                  <label htmlFor="delivery-city">City *</label>
                  <input
                    id="delivery-city"
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Enter your city"
                    required
                  />

                  <label htmlFor="delivery-pincode">PIN Code *</label>
                  <input
                    id="delivery-pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    minLength={6}
                    pattern="[0-9]{6}"
                    value={deliveryPincode}
                    onChange={(e) =>
                      setDeliveryPincode(
                        e.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                    }
                    placeholder="Enter 6-digit PIN code"
                    required
                  />

                  <label htmlFor="delivery-instructions">
                    Additional Delivery Instructions
                  </label>
                  <textarea
                    id="delivery-instructions"
                    value={deliveryInstructions}
                    onChange={(e) =>
                      setDeliveryInstructions(e.target.value)
                    }
                    placeholder="Any directions to help our delivery person?"
                  />

                  <p className="form-note">
                    Delivery is available throughout Madanapalle. Charges are
                    ₹30–₹50 depending on distance. The shop will confirm the
                    exact fee.
                  </p>
                </>
              )}

              <label htmlFor="order-instructions">Special Instructions</label>
              <textarea
                id="order-instructions"
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                placeholder="Any additional instructions?"
              />

              <label htmlFor="order-whatsapp">Send Order To</label>
              <select
                id="order-whatsapp"
                value={orderWhatsapp}
                onChange={(e) => setOrderWhatsapp(e.target.value)}
              >
                <option value="919390935986">+91 9390935986</option>
                <option value="918712339935">+91 8712339935</option>
              </select>

              <button type="submit" className="checkout-button">
                PLACE ORDER ON WHATSAPP
              </button>

              <p className="form-note">
                Your order will be reviewed by Chef Cakes. The shop will
                confirm availability, the exact delivery charge and final
                payment amount.
              </p>
            </form>
          </div>
        </div>
      )}

      <main>
        {/* HERO SECTION */}
        <section className="hero-section" id="home">
          <div className="hero-content">
            <span className="eyebrow">PREMIUM CAKES & DESSERTS</span>
            <h1>
              Every Celebration
              <br />
              Deserves a <span>Sweet</span>
              <br />
              Masterpiece.
            </h1>
            <p>
              Beautiful cakes, delicious desserts and unforgettable moments.
              Made with love, crafted for you.
            </p>
            <div className="hero-actions">
              <a className="gold-button" href="#menu">
                Explore Our Menu
              </a>
              <a className="outline-button" href="#custom">
                Customise Your Cake
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900"
              alt="Chocolate celebration cake"
            />
            <div className="image-caption">MADE FOR YOUR SPECIAL MOMENTS</div>
          </div>
        </section>

        {/* MENU SECTION */}
        <section className="categories" id="menu">
          <span className="eyebrow">DISCOVER OUR COLLECTION</span>
          <h2 className="section-title">
            Something Delicious <span>For Everyone</span>
          </h2>
          <p className="section-subtitle">
            Choose a category to explore our menu
          </p>

          <div className="category-grid">
            <button
              className={`category-card ${
                activeCategory === 'All' ? 'selected-category' : ''
              }`}
              onClick={() => setActiveCategory('All')}
            >
              <span className="category-icon">✨</span>
              <span className="category-info">
                <strong>ALL ITEMS</strong>
                <small>Explore our complete menu</small>
                <em>VIEW EVERYTHING →</em>
              </span>
            </button>

            {categories.map((category) => (
              <button
                className={`category-card ${
                  activeCategory === category.key ? 'selected-category' : ''
                }`}
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-info">
                  <strong>{category.name.toUpperCase()}</strong>
                  <small>{category.description}</small>
                  <em>EXPLORE COLLECTION →</em>
                </span>
              </button>
            ))}
          </div>

          <div className="menu-heading">
            <span className="eyebrow">FRESH FROM OUR MENU</span>
            <h2 className="section-title">
              OUR{' '}
              <span>
                {activeCategory === 'All'
                  ? 'MENU'
                  : activeCategory.toUpperCase()}
              </span>
            </h2>
          </div>

          {sections.map((section) => {
            const sectionItems = filteredItems.filter((item) =>
              section === 'Cakes'
                ? item.category === 'Cakes'
                : item.section === section
            );

            if (sectionItems.length === 0) return null;

            return (
              <div className="menu-section" key={section}>
                <h3 className="menu-section-title">{section}</h3>

                <div className="product-grid">
                  {sectionItems.map((item, index) => (
                    <article
                      className="product-card"
                      key={`${item.id || item.name}-${index}`}
                    >
                      {item.image_url && (
                        <div className="product-image">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.parentElement?.classList.add(
                                'image-error'
                              );
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="product-topline">
                        <span className="product-category">
                          {item.category}
                        </span>

                        {item.tag && (
                          <span
                            className={
                              item.tag === 'VEG'
                                ? 'food-tag veg-tag'
                                : 'food-tag nonveg-tag'
                            }
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>

                      <h4>{item.name}</h4>

                      {item.sizes ? (
                        <div className="size-options">
                          {item.sizes.map((size) => (
                            <div className="size-row" key={size.label}>
                              <span>{size.label}</span>
                              <strong>₹{size.price}</strong>
                              <button
                                onClick={() =>
                                  addToCart(item.name, size.label, size.price)
                                }
                              >
                                ADD +
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="single-price-row">
                          <strong>₹{item.price}</strong>
                          <button
                            onClick={() =>
                              addToCart(
                                item.name,
                                item.section || 'Regular',
                                item.price || 0
                              )
                            }
                          >
                            ADD +
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* CUSTOM CAKE PROMOTION */}
        <section className="custom-section" id="custom">
          <div>
            <span className="eyebrow">YOUR IDEA, OUR CREATION</span>
            <h2>
              Dream It. Design It. <span>We'll Bake It.</span>
            </h2>
            <p>
              Found your dream cake design? Share your reference picture with us
              and let our cake artists bring it to life.
            </p>
            <a className="gold-button" href="#custom-order">
              Request a Custom Cake
            </a>
            <p className="custom-charge">
              Customise charges ₹150–₹250 per kg · Heart shape ₹100 · Photo
              print ₹300
            </p>
          </div>

          <div className="custom-decoration">
            ✦<br />
            CUSTOM
            <br />
            CAKES
            <br />✦
          </div>
        </section>

        {/* CUSTOM CAKE FORM */}
        <section className="custom-form-section" id="custom-order">
          <div className="custom-form-heading">
            <span className="eyebrow">MAKE YOUR DREAM CAKE</span>
            <h2>
              ORDER YOUR <span>CUSTOM CAKE</span>
            </h2>
            <p>
              Share your requirements and reference image. Our team will review
              your design and send you a quotation.
            </p>
          </div>

          <form className="custom-order-form" onSubmit={handleCustomSubmit}>
            <label htmlFor="customer-name">Your Name *</label>
            <input
              id="customer-name"
              type="text"
              placeholder="Enter your name"
              value={cakeName}
              onChange={(e) => setCakeName(e.target.value)}
              required
            />

            <label htmlFor="customer-phone">WhatsApp / Phone Number *</label>
            <input
              id="customer-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              minLength={10}
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit mobile number"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              required
            />

            <label htmlFor="cake-flavour">Cake Flavour *</label>
            <select
              id="cake-flavour"
              value={cakeFlavour}
              onChange={(e) => setCakeFlavour(e.target.value)}
            >
              {[
                'Pineapple',
                'Mango',
                'Strawberry',
                'Butter Scotch',
                'Black Forest',
                'White Forest',
                'Swiss Chocolate',
                'Red Velvet',
                'Rasmalai',
                'Ferrero Rocher',
                'Oreo Cake',
                'Dutch Truffle',
                'Other / Discuss with shop',
              ].map((flavour) => (
                <option key={flavour} value={flavour}>
                  {flavour}
                </option>
              ))}
            </select>

            <label htmlFor="cake-weight">Cake Weight *</label>
            <select
              id="cake-weight"
              value={cakeWeight}
              onChange={(e) => setCakeWeight(e.target.value)}
            >
              <option>500 GM</option>
              <option>1 KG</option>
              <option>1.5 KG</option>
              <option>2 KG</option>
              <option>3 KG</option>
              <option>Custom Weight</option>
            </select>

            <label htmlFor="cake-quantity">Quantity *</label>
            <input
              id="cake-quantity"
              type="number"
              min="1"
              max="50"
              value={cakeQuantity}
              onChange={(e) => setCakeQuantity(e.target.value)}
              required
            />

            <label htmlFor="reference-image">Upload Reference Cake Image</label>
            <input
              id="reference-image"
              type="file"
              accept="image/*"
              onChange={(e) => setReferenceImage(e.target.files?.[0] || null)}
            />

            {referenceImage && (
              <p className="selected-file">
                Selected image: {referenceImage.name}
              </p>
            )}

            <label htmlFor="cake-design">Describe Your Cake Design *</label>
            <textarea
              id="cake-design"
              placeholder="Describe how you want your cake..."
              value={cakeDesign}
              onChange={(e) => setCakeDesign(e.target.value)}
              required
            />

            <label htmlFor="cake-colour">Preferred Cake Colours</label>
            <input
              id="cake-colour"
              type="text"
              placeholder="Example: Black and gold"
              value={cakeColour}
              onChange={(e) => setCakeColour(e.target.value)}
            />

            <label htmlFor="cake-message">Message on Cake</label>
            <input
              id="cake-message"
              type="text"
              placeholder="Example: Happy Birthday Rahul"
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
            />

            <label htmlFor="delivery-date">Required Delivery Date *</label>
            <input
              id="delivery-date"
              type="date"
              min={localToday}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />

            <label htmlFor="whatsapp-number">Send Enquiry To</label>
            <select
              id="whatsapp-number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            >
              <option value="919390935986">+91 9390935986</option>
              <option value="918712339935">+91 8712339935</option>
            </select>

            <button type="submit" className="custom-submit-button">
              SEND CUSTOM CAKE ENQUIRY ON WHATSAPP
            </button>

            <p className="form-note">
              Our team will review your design and share the price. Your order
              will be confirmed after you approve the quotation.
            </p>
          </form>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact">
        <h2>CHEF CAKES</h2>
        <p>Premium Cakes & Desserts</p>
        <p>Made with love. Served with happiness.</p>

        <div className="footer-address">
          <h3>Visit Our Store</h3>
          <p>
            G-Block, Tippu Sultan Complex,
            <br />
            Kadiri Road,
            <br />
            Madanapalli.
          </p>
          <a
            href="https://maps.app.goo.gl/VUe7hkAx1dCDHNEf6"
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Get Directions on Google Maps
          </a>
        </div>

        <div className="footer-contacts">
          <a href="tel:+919390935986">+91 9390935986</a>
          <a href="tel:+918712339935">+91 8712339935</a>
        </div>

        <div className="admin-footer-link">
          <a href="/admin">Admin Login</a>
        </div>

        <small>© 2026 Chef Cakes. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;
