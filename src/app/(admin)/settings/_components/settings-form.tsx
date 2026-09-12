"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon, Mail, Send, ExternalLink, MapPin, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect, LiyonSwitchRow, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, testSmtpConnectionAction, testGeminiConnectionAction } from "@/features/identity/actions";
import { GEMINI_MODELS } from "@/shared/lib/ai/gemini";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: {
      enabled: initial.smtp?.enabled ?? false,
      user: initial.smtp?.user ?? "",
      pass: initial.smtp?.pass ?? "",
      from: initial.smtp?.from ?? "",
    },
    contact: {
      address: initial.contact?.address ?? "",
      phone: initial.contact?.phone ?? "",
      email: initial.contact?.email ?? "",
      workingHours: initial.contact?.workingHours ?? "",
      mapUrl: initial.contact?.mapUrl ?? "",
      facebookUrl: initial.contact?.facebookUrl ?? "",
      lineId: initial.contact?.lineId ?? "",
    },
    gemini: {
      apiKey: initial.gemini?.apiKey ?? "",
      model: initial.gemini?.model ?? "gemini-3.6-flash",
    },
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);


  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.logoHint"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.logoHint"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(t("settings.logoUploadErr"));
        return;
      }

      setForm((prev) => ({ ...prev, logoUrl: data.url }));
      toast.success(t("settings.logoUploadOk"));
    } catch {
      toast.error(t("settings.logoUploadErr"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveLogo() {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleTestSmtp() {
    if (!form.smtp.user) {
      toast.error(t("settings.smtpUser") + ": " + t("common.required"));
      return;
    }
    if (!form.smtp.pass) {
      toast.error(t("settings.smtpPass") + ": " + t("common.required"));
      return;
    }
    const targetEmail = testTo.trim() || form.smtp.user;
    if (!targetEmail) {
      toast.error(t("settings.smtpTestTo") + ": " + t("common.required"));
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await testSmtpConnectionAction({
        user: form.smtp.user,
        pass: form.smtp.pass,
        from: form.smtp.from,
        testTo: targetEmail,
      });
      if (res.ok) {
        toast.success(`${t("settings.smtpTestSuccess")} (${targetEmail})`);
      } else {
        toast.error(`${t("settings.smtpTestFail")}: ${res.error.message || res.error.code}`);
      }
    } catch (err) {
      toast.error(`${t("settings.smtpTestFail")}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestingSmtp(false);
    }
  }

  async function handleTestGemini() {
    if (!form.gemini.apiKey) {
      toast.error(t("settings.geminiApiKey") + ": " + t("common.required"));
      return;
    }

    setTestingGemini(true);
    try {
      const res = await testGeminiConnectionAction({
        apiKey: form.gemini.apiKey,
        model: form.gemini.model,
      });
      if (res.ok) {
        toast.success(t("settings.geminiTestSuccess"));
      } else {
        const detail =
          res.error.message && res.error.message !== "internal"
            ? res.error.message
            : t("error.internal");
        toast.error(`${t("settings.geminiTestFail")}: ${detail}`);
      }
    } catch (err) {
      toast.error(`${t("settings.geminiTestFail")}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestingGemini(false);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph">
        <h1>{t("settings.title")}</h1>
      </header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}>
              <input
                id="s-name-th"
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
              />
            </LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}>
              <input
                id="s-name-en"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </LiyonField>

            {/* Logo Upload & Preview Section */}
            <LiyonField
              label={t("settings.logoUrl")}
              htmlFor="s-logo"
              hint={t("common.optional")}
              error={errors.logoUrl?.[0]}
            >
              <div className="space-y-3">
                <div className="logo-up">
                  <div className="prev">
                    {form.logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={form.logoUrl} alt="Logo preview" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground opacity-60" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        id="logo-upload-input"
                        onChange={handleFileUpload}
                        disabled={uploading || pending}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading || pending}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5"
                      >
                        {uploading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>{uploading ? t("settings.uploading") : t("settings.uploadLogo")}</span>
                      </Button>
                      {form.logoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={uploading || pending}
                          onClick={handleRemoveLogo}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>{t("settings.removeLogo")}</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("settings.logoHint")}</p>
                  </div>
                </div>

                {/* Optional Manual URL input */}
                <input
                  id="s-logo"
                  type="text"
                  placeholder="https://... หรือ /uploads/logos/..."
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
            </LiyonField>
          </div>
        </LiyonCard>

        {/* Contact & Location Information Card */}
        <LiyonCard>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="!mb-0">{t("settings.contactTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.contactDesc")}</p>

          <div className="fields space-y-4">
            <LiyonField
              label={t("settings.contactAddress")}
              htmlFor="s-contact-address"
              hint={t("common.optional")}
            >
              <textarea
                id="s-contact-address"
                rows={2}
                placeholder={t("settings.contactAddressPlaceholder")}
                value={form.contact.address}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value },
                  }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.contactPhone")}
                htmlFor="s-contact-phone"
                hint={t("common.optional")}
              >
                <input
                  id="s-contact-phone"
                  type="text"
                  placeholder={t("settings.contactPhonePlaceholder")}
                  value={form.contact.phone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value },
                    }))
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactEmail")}
                htmlFor="s-contact-email"
                hint={t("common.optional")}
              >
                <input
                  id="s-contact-email"
                  type="email"
                  placeholder={t("settings.contactEmailPlaceholder")}
                  value={form.contact.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }))
                  }
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.contactHours")}
                htmlFor="s-contact-hours"
                hint={t("common.optional")}
              >
                <input
                  id="s-contact-hours"
                  type="text"
                  placeholder={t("settings.contactHoursPlaceholder")}
                  value={form.contact.workingHours}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, workingHours: e.target.value },
                    }))
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactMapUrl")}
                htmlFor="s-contact-map-url"
                hint={t("settings.contactMapUrlHint")}
              >
                <input
                  id="s-contact-map-url"
                  type="url"
                  placeholder={t("settings.contactMapUrlPlaceholder")}
                  value={form.contact.mapUrl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, mapUrl: e.target.value },
                    }))
                  }
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.contactFacebook")}
                htmlFor="s-contact-facebook"
                hint={t("common.optional")}
              >
                <input
                  id="s-contact-facebook"
                  type="text"
                  placeholder={t("settings.contactFacebookPlaceholder")}
                  value={form.contact.facebookUrl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, facebookUrl: e.target.value },
                    }))
                  }
                />
              </LiyonField>

              <LiyonField
                label={t("settings.contactLineId")}
                htmlFor="s-contact-line"
                hint={t("common.optional")}
              >
                <input
                  id="s-contact-line"
                  type="text"
                  placeholder={t("settings.contactLineIdPlaceholder")}
                  value={form.contact.lineId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, lineId: e.target.value },
                    }))
                  }
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker
            value={form.palette}
            onChange={(p) => setForm({ ...form, palette: p })}
            label={t("settings.paletteLabel")}
          />
          {form.palette === "coral" && (
            <p className="warn" role="note">
              {t("settings.coralWarn")}
            </p>
          )}
        </LiyonCard>

        {/* Gmail SMTP Card */}
        <LiyonCard>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="!mb-0">{t("settings.smtpTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.smtpDesc")}</p>

          <LiyonSwitchRow
            id="smtp-enabled"
            checked={form.smtp.enabled}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, enabled: checked } }))
            }
            label={t("settings.smtpEnabled")}
            description={t("settings.smtpEnabledDesc")}
            disabled={pending}
          />

          {form.smtp.enabled && (
            <div className="fields mt-4 space-y-4 pt-4 border-t border-border">
              <LiyonField
                label={t("settings.smtpUser")}
                htmlFor="smtp-user"
                error={errors["smtp.user"]?.[0]}
              >
                <input
                  id="smtp-user"
                  type="email"
                  placeholder={t("settings.smtpUserPlaceholder")}
                  value={form.smtp.user}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      smtp: { ...prev.smtp, user: e.target.value },
                    }))
                  }
                  disabled={pending}
                />
              </LiyonField>

              <LiyonField
                label={t("settings.smtpPass")}
                htmlFor="smtp-pass"
                hint={t("settings.smtpPassHint")}
                error={errors["smtp.pass"]?.[0]}
              >
                <div className="space-y-1.5">
                  <input
                    id="smtp-pass"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={form.smtp.pass}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        smtp: { ...prev.smtp, pass: e.target.value },
                      }))
                    }
                    disabled={pending}
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <span>{t("settings.smtpPassHelpLink")} (Google App Passwords)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </LiyonField>

              <LiyonField
                label={t("settings.smtpFrom")}
                htmlFor="smtp-from"
                hint={t("common.optional")}
              >
                <input
                  id="smtp-from"
                  placeholder={t("settings.smtpFromPlaceholder")}
                  value={form.smtp.from}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      smtp: { ...prev.smtp, from: e.target.value },
                    }))
                  }
                  disabled={pending}
                />
              </LiyonField>

              {/* Test Connection Section */}
              <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-3 mt-4">
                <div className="flex items-center gap-1.5 font-medium text-sm">
                  <Send className="h-4 w-4 text-primary" />
                  <span>{t("settings.smtpTestSection")}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                  <div className="flex-1 space-y-1">
                    <label htmlFor="smtp-test-to" className="text-xs text-muted-foreground">
                      {t("settings.smtpTestTo")}
                    </label>
                    <input
                      id="smtp-test-to"
                      type="email"
                      placeholder={form.smtp.user || "your-email@example.com"}
                      value={testTo}
                      onChange={(e) => setTestTo(e.target.value)}
                      disabled={testingSmtp || pending}
                      className="w-full text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingSmtp || pending || !form.smtp.user || !form.smtp.pass}
                    onClick={handleTestSmtp}
                    className="flex items-center gap-1.5 shrink-0"
                  >
                    {testingSmtp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{testingSmtp ? t("settings.smtpTesting") : t("settings.smtpTestBtn")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </LiyonCard>

        {/* Google Gemini AI Configuration Card */}
        <LiyonCard>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="!mb-0">{t("settings.geminiTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.geminiDesc")}</p>

          <div className="fields space-y-4">
            <LiyonField
              label={t("settings.geminiApiKey")}
              htmlFor="s-gemini-apikey"
              hint={t("settings.geminiApiKeyHint")}
              error={errors["gemini.apiKey"]?.[0]}
            >
              <div className="relative">
                <input
                  id="s-gemini-apikey"
                  type={showApiKey ? "text" : "password"}
                  placeholder={t("settings.geminiApiKeyPlaceholder")}
                  value={form.gemini.apiKey}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gemini: { ...form.gemini, apiKey: e.target.value },
                    })
                  }
                  className="w-full pr-10 font-mono text-sm"
                  disabled={pending}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </LiyonField>

            <LiyonField
              label={t("settings.geminiModel")}
              htmlFor="s-gemini-model"
              hint={t("settings.geminiModelHint")}
              error={errors["gemini.model"]?.[0]}
            >
              <LiyonSelect
                id="s-gemini-model"
                value={form.gemini.model}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gemini: { ...form.gemini, model: e.target.value },
                  })
                }
                disabled={pending}
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t("settings.geminiGetApiKey")}</span>
              </a>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={testingGemini || pending || !form.gemini.apiKey}
                onClick={handleTestGemini}
                className="flex items-center gap-1.5 shrink-0"
              >
                {testingGemini ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-500" />
                )}
                <span>{testingGemini ? t("settings.geminiTesting") : t("settings.geminiTestBtn")}</span>
              </Button>
            </div>
          </div>
        </LiyonCard>

        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending || uploading}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}
