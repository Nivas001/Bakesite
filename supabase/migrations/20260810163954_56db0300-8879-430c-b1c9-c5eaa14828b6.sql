-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending_approval', 'awaiting_payment', 'confirmed', 'completed', 'rejected');
CREATE TYPE public.discount_type AS ENUM ('none', 'percent', 'flat');

-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_type public.discount_type NOT NULL DEFAULT 'none',
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "products admin read" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blackout dates
CREATE TABLE public.blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blackout_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blackout_dates TO anon, authenticated;
GRANT ALL ON public.blackout_dates TO service_role;
ALTER TABLE public.blackout_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blackout public read" ON public.blackout_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "blackout admin write" ON public.blackout_dates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending_approval',
  fulfilment_type TEXT NOT NULL DEFAULT 'delivery',
  slot_date DATE NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  contact_name TEXT,
  contact_phone TEXT,
  delivery_address TEXT,
  delivery_lat DOUBLE PRECISION,
  delivery_lng DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin orders select" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin orders update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order items select" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "admin order items select" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed data
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Cookies', 'cookies', 'Small-batch cookies baked fresh each morning.', 1),
  ('Cakes', 'cakes', 'Celebration and everyday cakes made to order.', 2),
  ('Pastries', 'pastries', 'Flaky, buttery pastries straight from the oven.', 3);

INSERT INTO public.products (category_id, name, slug, description, price, discount_type, discount_value, image_url, stock)
VALUES
  ((SELECT id FROM public.categories WHERE slug='cookies'), 'Brown Butter Choc Chip', 'brown-butter-choc-chip', 'Nutty brown butter dough, dark chocolate puddles and a flake of sea salt.', 240, 'percent', 15, '/products/choc-chip-cookies.jpg', 40),
  ((SELECT id FROM public.categories WHERE slug='cookies'), 'Matcha White Chocolate', 'matcha-white-chocolate', 'Stone-ground matcha cookies studded with creamy white chocolate.', 280, 'none', 0, '/products/matcha-cookies.jpg', 30),
  ((SELECT id FROM public.categories WHERE slug='cookies'), 'Double Cocoa Fudge', 'double-cocoa-fudge', 'Deeply chocolatey, fudgy centre, crackled top.', 260, 'flat', 30, '/products/cocoa-cookies.jpg', 35),
  ((SELECT id FROM public.categories WHERE slug='cakes'), 'Vanilla Bean Celebration Cake', 'vanilla-bean-cake', 'Three layers of vanilla bean sponge with silky Swiss meringue buttercream.', 1450, 'none', 0, '/products/vanilla-cake.jpg', 8),
  ((SELECT id FROM public.categories WHERE slug='cakes'), 'Dark Cocoa Truffle Cake', 'dark-cocoa-truffle-cake', 'Rich cocoa sponge layered with dark chocolate ganache.', 1650, 'percent', 10, '/products/chocolate-cake.jpg', 6),
  ((SELECT id FROM public.categories WHERE slug='cakes'), 'Strawberry Cream Gateau', 'strawberry-cream-gateau', 'Light sponge, fresh cream and macerated strawberries.', 1550, 'none', 0, '/products/strawberry-cake.jpg', 5),
  ((SELECT id FROM public.categories WHERE slug='pastries'), 'Classic Butter Croissant', 'butter-croissant', 'Laminated over three days with cultured butter.', 120, 'none', 0, '/products/croissant.jpg', 60),
  ((SELECT id FROM public.categories WHERE slug='pastries'), 'Pistachio Danish', 'pistachio-danish', 'Buttery danish with pistachio frangipane and toasted nuts.', 180, 'percent', 20, '/products/pistachio-danish.jpg', 24),
  ((SELECT id FROM public.categories WHERE slug='pastries'), 'Cinnamon Morning Bun', 'cinnamon-morning-bun', 'Spiralled cinnamon sugar bun, crisp edges and soft middle.', 150, 'none', 0, '/products/cinnamon-bun.jpg', 28);

INSERT INTO public.blackout_dates (blackout_date, reason)
VALUES ((CURRENT_DATE + INTERVAL '3 days')::date, 'Bakery holiday');