"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

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

        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending || uploading}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}
