# -*- coding: utf-8 -*-
"""
Calcul de reference INDEPENDANT des cas de validation (EN 1991-4:2006).

Ce script n'est pas le code de l'application : il sert a etablir les valeurs
attendues ecrites en dur dans les tests. Il ne doit jamais etre importe par
l'application ni par les tests. Unites : m, kN/m3, kPa (= kN/m2), kN/m.

Usage : python3 docs/validation/reference.py
"""
import math

SABLE = dict(gamma=16.0, phi_r=39.0, phi_im=36.0, a_phi=1.09, K_m=0.45, a_K=1.11,
             mu_m={"D1": 0.38, "D2": 0.48, "D3": 0.57}, a_mu=1.16, C_op=0.4)


def carac(m, paroi="D2"):
    mu = m["mu_m"][paroi]
    return dict(K_sup=m["K_m"] * m["a_K"], K_inf=m["K_m"] / m["a_K"],
                mu_sup=mu * m["a_mu"], mu_inf=mu / m["a_mu"],
                phi_sup=m["phi_im"] * m["a_phi"], phi_inf=m["phi_im"] / m["a_phi"])


def geom_rect(a, b):
    return dict(A=a * b, U=2 * (a + b), dc=min(a, b))


def geom_circ(d):
    return dict(A=math.pi * d * d / 4, U=math.pi * d, dc=d)


# silos elances, Janssen (5.1 a 5.7)
def janssen(z, g, gamma, K, mu):
    z0 = g["A"] / (K * mu * g["U"])
    pho = gamma * K * z0
    YJ = 1 - math.exp(-z / z0)
    return dict(z0=z0, pho=pho, YJ=YJ, ph=pho * YJ, pw=mu * pho * YJ,
                pv=pho / K * YJ, nz=mu * pho * (z - z0 * YJ))


def C_patch(coef, Cop, hc_dc, E):
    """coef = 0.21 (Cpf, 5.9) ou 0.42 (Cpe, 5.28), branche hc/dc >= 1,2."""
    return max(0.0, coef * Cop * (1 + 2 * E * E) * (1 - math.exp(-1.5 * (hc_dc - 1))))


# silos peu elances / intermediaires (5.71 a 5.81)
def janssen_modifie(z, g, gamma, K, mu, ho, phi_r):
    z0 = g["A"] / (K * mu * g["U"])
    pho = gamma * K * z0
    n = -(1 + math.tan(math.radians(phi_r))) * (1 - ho / z0)
    if z <= ho:
        YR, zV = 0.0, z  # pas de contact paroi au dessus de ho (pv non utilise ici)
    else:
        YR = 1 - ((z - ho) / (z0 - ho) + 1) ** n
        zV = ho - 1 / (n + 1) * (z0 - ho - (z + z0 - 2 * ho) ** (n + 1) / (z0 - ho) ** n)
    return dict(z0=z0, pho=pho, n=n, YR=YR, ph=pho * YR, pw=mu * pho * YR,
                zV=zV, pv=gamma * zV, nz=mu * pho * (z - zV) if z > ho else 0.0)


# tremies (6.7 a 6.25)
def pv_tremie(x, hh, gamma, n, pvft):
    r = x / hh
    if abs(n - 1) < 1e-9:
        terme = -r * math.log(r) if r > 0 else 0.0
    else:
        terme = (r - r ** n) / (n - 1)
    return gamma * hh * terme + pvft * r ** n


def Fe_walker(beta_deg, mu_h, phi_i_deg):
    phw = math.atan(mu_h)
    phi = math.radians(phi_i_deg)
    eps = phw + math.asin(math.sin(phw) / math.sin(phi))
    b = math.radians(beta_deg)
    return (1 + math.sin(phi) * math.cos(eps)) / (1 - math.sin(phi) * math.cos(2 * b + eps)), eps


def f(x, n=4):
    return f"{x:.{n}f}"


def titre(t):
    print("\n" + "=" * 78 + "\n" + t + "\n" + "=" * 78)


m = SABLE
c = carac(m)
print("Valeurs caracteristiques sable D2 :", {k: round(v, 6) for k, v in c.items()})

# ============================================================================
titre("V1 - rectangulaire 6 x 4 m, hc = 20 m, elance, AAC 2, vidange centree")
g = geom_rect(6.0, 4.0); hc = 20.0; gam = m["gamma"]
print("A, U, A/U, dc :", g["A"], g["U"], g["A"] / g["U"], g["dc"], " hc/dc =", hc / g["dc"])
print("capacite (t) =", f(g["A"] * hc * gam / 9.81, 1))
Cpf = C_patch(0.21, m["C_op"], hc / g["dc"], 0.0); Cpe = C_patch(0.42, m["C_op"], hc / g["dc"], 0.0)
print("Cpf =", f(Cpf, 6), " Cpe =", f(Cpe, 6), " s =", f(math.pi * g["dc"] / 16, 4))
print("z | phf | ppf,nc | phf+ppf,nc | phe | ppe,nc | phe+ppe,nc   (cas 1 : K sup, mu inf)")
for z in (1, 5, 10, 20):
    j = janssen(z, g, gam, c["K_sup"], c["mu_inf"])
    phe = 1.15 * j["ph"]
    print(z, f(j["ph"]), f(0.36 * Cpf * j["ph"]), f(j["ph"] * (1 + 0.36 * Cpf)), f(phe),
          f(0.36 * Cpe * phe), f(phe * (1 + 0.36 * Cpe)))
j1 = janssen(20, g, gam, c["K_sup"], c["mu_inf"])
print("cas 1 : z0 =", f(j1["z0"]), " pho =", f(j1["pho"]))
print("z | pwf | pwe | nzSk remplissage | nzSk vidange   (cas 2 : K sup, mu sup)")
for z in (1, 5, 10, 20):
    j = janssen(z, g, gam, c["K_sup"], c["mu_sup"])
    print(z, f(j["pw"]), f(1.10 * j["pw"]), f(j["nz"]), f(1.10 * j["nz"]))
j2 = janssen(20, g, gam, c["K_sup"], c["mu_sup"]); print("cas 2 : z0 =", f(j2["z0"]), " pho =", f(j2["pho"]))
j3 = janssen(20, g, gam, c["K_inf"], c["mu_inf"])
print("cas 3 : z0 =", f(j3["z0"]), " pho =", f(j3["pho"]), " pvf(hc) =", f(j3["pv"]))
print("fond plat : pvft (Cb = 1,0) =", f(j3["pv"]), " ; pvft (Cb = 1,2, materiau non faiblement cohesif) =", f(1.2 * j3["pv"]))
print("bandes de 1 m, vidange (phe + ppe,nc) : haut | bas")
tot = 0
for i in range(20):
    zt, zb = i, i + 1
    pt = 1.15 * (1 + 0.36 * Cpe) * janssen(zt, g, gam, c["K_sup"], c["mu_inf"])["ph"] if zt > 0 else 0.0
    pb = 1.15 * (1 + 0.36 * Cpe) * janssen(zb, g, gam, c["K_sup"], c["mu_inf"])["ph"]
    tot += (pt + pb) / 2
    if i in (0, 1, 2, 19):
        print(f"  bande {i+1} [{zt};{zb}] : {f(pt)} | {f(pb)}")
exact = 1.15 * (1 + 0.36 * Cpe) * j1["pho"] * (hc - j1["z0"] * (1 - math.exp(-hc / j1["z0"])))
print("somme trapezes =", f(tot, 3), " integrale exacte =", f(exact, 3), " ecart =", f(100 * (tot / exact - 1), 3), "%")

# ============================================================================
titre("V2 - circulaire d = 6 m, t = 0,20 m (paroi epaisse), hc = 18 m, eo = 2,0 m, AAC 2")
g = geom_circ(6.0); hc = 18.0; t = 0.20; eo = 2.0; ef = 0.0
cap = g["A"] * hc * gam / 9.81
print("A =", f(g["A"]), " U =", f(g["U"]), " A/U =", f(g["A"] / g["U"]), " dc/t =", g["dc"] / t,
      " hc/dc =", hc / g["dc"], " capacite (t) =", f(cap, 1), " eo/dc =", f(eo / g["dc"]))
E = 2 * max(ef, eo) / g["dc"]; Ef = 2 * ef / g["dc"]
Cpf = C_patch(0.21, m["C_op"], hc / g["dc"], Ef); Cpe = C_patch(0.42, m["C_op"], hc / g["dc"], E)
s = math.pi * g["dc"] / 16
print("E =", f(E), " Cpf =", f(Cpf, 6), " Cpe =", f(Cpe, 6), " s =", f(s))
zeta = max(1.0, 0.5 + 0.01 * g["dc"] / t)
print("zeta (5.40, 5.41) =", f(zeta))
for z in (9, 18):
    j = janssen(z, g, gam, c["K_sup"], c["mu_inf"])
    phe = 1.15 * j["ph"]; ppf = Cpf * j["ph"]; ppe = Cpe * phe
    print(f"z = {z} : phf = {f(j['ph'])}, ppf = {f(ppf)}, ppfi = {f(ppf/7)}, phe = {f(phe)}, "
          f"ppe = {f(ppe)}, ppei = {f(ppe/7)}, phf,u = {f(j['ph']*(1+zeta*Cpf))}, phe,u = {f(phe*(1+zeta*Cpe))}")
j1 = janssen(18, g, gam, c["K_sup"], c["mu_inf"]); print("cas 1 : z0 =", f(j1["z0"]), " pho =", f(j1["pho"]))
print("Vidange a grand excentrement 5.2.4.2 (eo > 0,25 dc) : mu inf, phi_i sup ; theta_c = 35 deg")
for z in (9, 18):
    j = janssen(z, g, gam, c["K_sup"], c["mu_inf"])
    print(f"z = {z} : phce = 0, phse = {f(j['ph'])}, phae = {f(2*j['ph'])}, pwse = {f(j['pw'])}, pwae = {f(2*j['pw'])}")
print("NOTE : K de la vidange excentree non fixe par 5.2.4.1(4) ; valeurs ci-dessus avec K sup (choix declare)")

# ============================================================================
titre("V3 - circulaire d = 10 m, hc = 15 m (elancement intermediaire), AAC 2, centre")
g = geom_circ(10.0); hc = 15.0; r = 5.0
ho = r / 3 * math.tan(math.radians(m["phi_r"])); htp = r * math.tan(math.radians(m["phi_r"]))
CS = hc / g["dc"] - 1
print("A =", f(g["A"]), " U =", f(g["U"]), " hc/dc =", hc / g["dc"], " capacite (t) =", f(g["A"] * hc * gam / 9.81, 1))
print("ho =", f(ho), " htp =", f(htp), " CS =", f(CS), " Ch =", f(1 + 0.15 * CS), " Cw =", f(1 + 0.1 * CS))
Cpf = C_patch(0.21, m["C_op"], hc / g["dc"], 0); Cpe = C_patch(0.42, m["C_op"], hc / g["dc"], 0)
print("Cpf =", f(Cpf, 6), " Cpe =", f(Cpe, 6))
jm = janssen_modifie(15, g, gam, c["K_sup"], c["mu_inf"], ho, m["phi_r"])
print("cas 1 : z0 =", f(jm["z0"]), " pho =", f(jm["pho"]), " n =", f(jm["n"], 6))
print("z | YR | phf | phe = Ch phf")
for z in (ho, 2, 5, 10, 15):
    jm = janssen_modifie(z, g, gam, c["K_sup"], c["mu_inf"], ho, m["phi_r"])
    print(f(z), f(jm["YR"], 6), f(jm["ph"]), f((1 + 0.15 * CS) * jm["ph"]))
print("cas 2 (K sup, mu sup) : z | pwf | pwe | nzSk vidange")
for z in (5, 15):
    jm = janssen_modifie(z, g, gam, c["K_sup"], c["mu_sup"], ho, m["phi_r"])
    print(z, f(jm["pw"]), f((1 + 0.1 * CS) * jm["pw"]), f((1 + 0.1 * CS) * jm["nz"]))
j3 = janssen_modifie(15, g, gam, c["K_inf"], c["mu_inf"], ho, m["phi_r"])
pvb = j3["pv"]; pvtp = gam * htp; pvho = gam * ho
pvsq = pvb + (pvtp - pvho) * (2 - hc / g["dc"]) / (2 - htp / g["dc"])
print("cas 3 : zV(hc) =", f(j3["zV"]), " pvb = pvf(hc) =", f(pvb))
print("fond plat 6.2.2 : pvtp =", f(pvtp), " pvho =", f(pvho), " facteur =", f((2 - hc / g["dc"]) / (2 - htp / g["dc"]), 6),
      " pvsq =", f(pvsq))

# ============================================================================
titre("V4 - tremie conique profonde sous V2 (d = 6 m, hc = 18 m), beta = 30 deg, paroi D2")
g = geom_circ(6.0); hc = 18.0; beta = 30.0
hh = 3.0 / math.tan(math.radians(beta)); mu_h = c["mu_inf"]; S = 2
crit = (1 - c["K_inf"]) / (2 * mu_h)
print("volume tremie (m3) =", f(math.pi * 9 * hh / 3), " ho V1 =", f(4 * math.tan(math.radians(39)) / 4, 6), " ho V2 =", f(math.tan(math.radians(39)), 6))
print("hh =", f(hh), " tan beta =", f(math.tan(math.radians(beta))), " (1-K inf)/(2 mu_h) =", f(crit), " -> profonde :",
      math.tan(math.radians(beta)) < crit)
# remplissage : K inf, mu inf
pvft_f = janssen(hc, g, gam, c["K_inf"], c["mu_inf"])["pv"]
Ff = 1 - 0.2 / (1 + math.tan(math.radians(beta)) / mu_h)
n_f = S * (1 - 0.2) * mu_h / math.tan(math.radians(beta))
print("REMPLISSAGE : pvft =", f(pvft_f), " Ff =", f(Ff, 6), " n =", f(n_f, 6))
for x in (hh, hh / 2, hh / 4):
    pv = pv_tremie(x, hh, gam, n_f, pvft_f)
    print(f"  x = {f(x)} : pv = {f(pv)}, pnf = {f(Ff*pv)}, ptf = {f(mu_h*Ff*pv)}")
# vidange : K sup, mu inf (choix declare pour la paroi verticale), phi_i sup
pvft_e = janssen(hc, g, gam, c["K_sup"], c["mu_inf"])["pv"]
Fe, eps = Fe_walker(beta, mu_h, c["phi_sup"])
n_e = S * (Fe * mu_h / math.tan(math.radians(beta)) + Fe) - 2
print("VIDANGE : pvft =", f(pvft_e), " phi_i sup =", f(c["phi_sup"]), " eps (deg) =", f(math.degrees(eps)),
      " Fe =", f(Fe, 6), " n =", f(n_e, 6))
for x in (hh, hh / 2, hh / 4):
    pv = pv_tremie(x, hh, gam, n_e, pvft_e)
    print(f"  x = {f(x)} : pv = {f(pv)}, pne = {f(Fe*pv)}, pte = {f(mu_h*Fe*pv)}")

# ============================================================================
titre("V5 - circulaire peu elance d = 12 m, t = 0,25 m, hc = 10 m, eo = 2,0 m, AAC 2")
g = geom_circ(12.0); hc = 10.0; t = 0.25; eo = 2.0; ef = 0.0; r = 6.0
ho = r / 3 * math.tan(math.radians(m["phi_r"])); htp = r * math.tan(math.radians(m["phi_r"]))
cap = g["A"] * hc * gam / 9.81
E = 2 * max(ef, eo) / g["dc"]; hcdc = hc / g["dc"]
print("hc/dc =", f(hcdc, 6), " capacite (t) =", f(cap, 1), " eo/dc =", f(eo / g["dc"]), " dc/t =", g["dc"] / t)
print("ho =", f(ho, 6), " htp =", f(htp, 6))
c528 = 0.42 * m["C_op"] * (1 + 2 * E * E) * (1 - math.exp(-1.5 * (hcdc - 1)))
c530 = 0.272 * m["C_op"] * (hcdc - 1 + E)
Cpe = max(c528, c530, 0.0)
print("E =", f(E, 6), " Cpe(5.28) =", f(c528, 6), " Cpe(5.30) =", f(c530, 6), " Cpe =", f(Cpe, 6))
print("remplissage : Cpf nul (5.3.1.2(3)) ; vidange : Ch = Cw = 1,0 (5.3.2.1(2))")
zeta = max(1.0, 0.5 + 0.01 * g["dc"] / t)
print("zeta =", f(zeta))
print("z | phf (C1) | ppe = Cpe phe | ppei | phe,u = phe (1 + zeta Cpe)")
for z in (5.0, 10.0):
    jm = janssen_modifie(z, g, gam, c["K_sup"], c["mu_inf"], ho, m["phi_r"])
    ph = jm["ph"]
    print(f(z), f(ph), f(Cpe * ph), f(Cpe * ph / 7), f(ph * (1 + zeta * Cpe)))

# ============================================================================
titre("V6 - tremie conique peu profonde sous V3 (d = 10 m, hc = 15 m), beta = 60 deg, paroi D2")
g = geom_circ(10.0); hc = 15.0; beta = 60.0; r = 5.0
ho = r / 3 * math.tan(math.radians(m["phi_r"]))
hh = r / math.tan(math.radians(beta)); mu_h = c["mu_inf"]; S = 2; b = 0.2
tb = math.tan(math.radians(beta))
crit = (1 - c["K_inf"]) / (2 * mu_h)
print("hh =", f(hh), " tan beta =", f(tb), " critere =", f(crit), " -> peu profonde :", not (tb < crit))
pvft = janssen_modifie(hc, g, gam, c["K_inf"], c["mu_inf"], ho, m["phi_r"])["pv"]
mu_heff = (1 - c["K_inf"]) / (2 * tb)
Ff = 1 - b / (1 + tb / mu_heff)
n = S * (1 - b) * mu_heff / tb
print("pvft (C3, Cb = 1) =", f(pvft), " mu_heff =", f(mu_heff, 6), " Ff =", f(Ff, 6), " n =", f(n, 6))
for x in (hh, hh / 2, hh / 4):
    pv = pv_tremie(x, hh, gam, n, pvft)
    print(f"  x = {f(x)} : pv = {f(pv)}, pnf = {f(Ff*pv)}, ptf = {f(mu_heff*Ff*pv)}")
print("vidange (6.4.3) : identique au remplissage")

titre("Cas limite n = 1 (6.7) : h_h = 4, gamma = 10, pvft = 50, x = 2")
print("pv =", f(pv_tremie(2.0, 4.0, 10.0, 1.0, 50.0)), " ; n = 1,5 :", f(pv_tremie(2.0, 4.0, 10.0, 1.5, 50.0)))


titre("Carte p(z, theta) des silos circulaires (lot 10), V2")
g = geom_circ(6.0); hc = 18.0; c = carac(SABLE); gam = SABLE["gamma"]
E = 2 * 2.0 / 6.0
Cpf = C_patch(0.21, 0.4, hc / 6.0, 0.0); Cpe = C_patch(0.42, 0.4, hc / 6.0, E)
s = math.pi * 6.0 / 16
print("s =", f(s, 6), " s/2 =", f(s / 2, 6), " demi-angle des carres (s / d_c, en degres) =", f(math.degrees(s / 6.0), 4))
# Paroi epaisse, classe 2 : z_p = hc/2 ; p_pf evalue a z_p, constant sur la hauteur s.
j = janssen(9.0, g, gam, c["K_sup"], c["mu_inf"])
phf, phe = j["ph"], 1.15 * j["ph"]
ppf, ppe = Cpf * phf, Cpe * phe
print("epaisse z = 9 : REMP theta 0 =", f(phf + ppf), " theta 90 =", f(phf - ppf / 7),
      " ; VID theta 0 =", f(phe + ppe), " theta 90 =", f(phe - ppe / 7))
# Paroi mince soudee (t = 0,02 m, dc/t = 300), classe 2 : z_p = min(z_o ; hc/2) (5.16).
z0 = janssen(1, g, gam, c["K_sup"], c["mu_inf"])["z0"]
zp = min(z0, hc / 2)
j = janssen(zp, g, gam, c["K_sup"], c["mu_inf"])
phf = j["ph"]; ppf = Cpf * phf
print("mince z_p =", f(zp), " phf(z_p) =", f(phf), " ppf =", f(ppf))
for th in (0, 60, 90, 180):
    print(f"  mince REMP theta {th} : {f(phf + ppf * math.cos(math.radians(th)))}")


titre("V7 - V2 en classe 3 : vidange excentree par le canal d'ecoulement (5.2.4.3)")
g = geom_circ(6.0); hc = 18.0; c = carac(SABLE); gam = SABLE["gamma"]; r = 3.0
mu = c["mu_inf"]; phi_i = math.radians(c["phi_sup"]); K = c["K_sup"]  # 5.2.4.1(4) ; K sup (P1)
eta = mu / math.tan(phi_i)
print("mu =", f(mu, 6), " phi_i =", f(c["phi_sup"]), " K =", f(K), " eta =", f(eta, 6))
for k in (0.25, 0.4, 0.6):
    rc = k * r; G = rc / r
    ec = r * (eta * (1 - G) + (1 - eta) * math.sqrt(1 - G))                 # 5.55
    thc = math.acos((r * r + ec * ec - rc * rc) / (2 * r * ec))            # 5.58
    psi = math.acos((r * r - ec * ec - rc * rc) / (2 * ec * rc))           # angle de la figure 5.5b, verifie par 5.61
    assert abs(math.sin(psi) - r / rc * math.sin(thc)) < 1e-9
    Uwc = 2 * thc * r; Usc = 2 * rc * (math.pi - psi)                       # 5.59, 5.60
    Ac = (math.pi - psi) * rc ** 2 + thc * r ** 2 - r * rc * math.sin(psi - thc)  # 5.62
    zoc = Ac / (K * (Uwc * mu + Usc * math.tan(phi_i)))                     # 5.66
    phco = gam * K * zoc                                                    # 5.65
    print(f"k = {k} : rc = {f(rc)}, ec = {f(ec)}, theta_c = {f(math.degrees(thc))} deg, psi = {f(math.degrees(psi))} deg, "
          f"Uwc = {f(Uwc)}, Usc = {f(Usc)}, Ac = {f(Ac)}, zoc = {f(zoc)}, phco = {f(phco)}")
    for z in (9.0, 18.0):
        j = janssen(z, g, gam, K, mu)
        phce = phco * (1 - math.exp(-z / zoc))                              # 5.63
        phae = 2 * j["ph"] - phce                                           # 5.69
        print(f"   z = {z} : phce = {f(phce)}, pwce = {f(mu*phce)}, phse = {f(j['ph'])}, pwse = {f(j['pw'])}, "
              f"phae = {f(phae)}, pwae = {f(mu*phae)}")

titre("V8 - V5 en classe 3, remplissage a grand excentrement e_t = 4 m (5.3.3)")
d = 12.0; r = 6.0; g = geom_circ(d); c = carac(SABLE); gam = SABLE["gamma"]
K = c["K_sup"]; mu = c["mu_sup"]; phi_r = math.radians(SABLE["phi_r"]); et = 4.0
pho = gam * r / (2 * mu)                                                    # 5.93
ho = r * math.tan(phi_r) * (1 - (et / r) ** 2) / 3                          # 5.96
B = r / (2 * mu * K) - ho                                                   # 5.95
print("K =", f(K), " mu =", f(mu), " pho =", f(pho), " ho =", f(ho), " B =", f(B))
for zs in (2.0, 5.0, 10.0):
    Z = zs / B                                                              # 5.94
    dn = 0.04 * pho * zs * math.tan(phi_r) * (et / r) * (6 + 7 * Z - Z * Z) # 5.92
    print(f"   z_s = {zs} : Z = {f(Z, 6)}, n_zSk additionnel = {f(dn)}")
zs = 10.0 + ho; Z = zs / B
print(f"   au pied de la paroi, z = hc = 10 : z_s = {f(zs)}, Z = {f(Z, 6)}, n_zSk additionnel = "
      f"{f(0.04 * pho * zs * math.tan(phi_r) * (et / r) * (6 + 7 * Z - Z * Z))}")
