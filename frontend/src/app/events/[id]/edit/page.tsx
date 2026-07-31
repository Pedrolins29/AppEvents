"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { EventForm, type EventFormValues } from "@/components/EventForm";
import { GuestListManager } from "@/components/GuestListManager";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Skeleton } from "@/components/Skeleton";
import { UpsellBanner } from "@/components/UpsellBanner";
import { ApiError } from "@/lib/auth-context";
import { eventsApi } from "@/lib/eventsApi";
import type { CreateEventRequest, EventImageRecord, EventRecord } from "@/types/event";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const t = useTranslations("events.edit");
  const listT = useTranslations("events.list");
  const photoT = useTranslations("photoUpload");
  const [initialValues, setInitialValues] = useState<EventFormValues | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [featuredPhotoUrl, setFeaturedPhotoUrl] = useState<string | null>(null);
  const [featuredPhotoPreviewUrl, setFeaturedPhotoPreviewUrl] = useState<string | null>(null);
  const [featuredPhotoError, setFeaturedPhotoError] = useState<string | null>(null);
  const [isFeaturedPhotoUploading, setIsFeaturedPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishToggling, setIsPublishToggling] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<EventImageRecord[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const coverPreviewRef = useRef<string | null>(null);
  const featuredPhotoPreviewRef = useRef<string | null>(null);

  function applyEvent(event: EventRecord) {
    setInitialValues({
      name: event.name,
      slug: event.slug,
      eventType: event.eventType,
      eventDate: event.eventDate.slice(0, 10),
      description: event.description ?? "",
      address: event.address ?? "",
      dressCode: event.dressCode ?? "",
      timelineItems: event.timelineItems,
      templateId: event.templateId,
    });
    setCoverImageUrl(event.coverImageUrl);
    setFeaturedPhotoUrl(event.featuredPhotoUrl);
    setIsPublished(event.isPublished);
    setGalleryImages(event.galleryImages);
  }

  useEffect(() => {
    eventsApi
      .get(params.id)
      .then(applyEvent)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError(t("notFound"));
        } else {
          setError(t("loadError"));
        }
      });
  }, [params.id, t]);

  useEffect(() => {
    return () => {
      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current);
      }
      if (featuredPhotoPreviewRef.current) {
        URL.revokeObjectURL(featuredPhotoPreviewRef.current);
      }
    };
  }, []);

  async function handleSubmit(request: CreateEventRequest) {
    await eventsApi.update(params.id, request);
    router.push("/events");
  }

  async function handleCoverImageChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    // Show the picked file immediately — no need to wait on the network round-trip to see it.
    if (coverPreviewRef.current) {
      URL.revokeObjectURL(coverPreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    coverPreviewRef.current = previewUrl;
    setCoverPreviewUrl(previewUrl);

    setUploadError(null);
    setIsUploading(true);
    try {
      const updated = await eventsApi.uploadCoverImage(params.id, file);
      setCoverImageUrl(updated.coverImageUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setUploadError(fieldErrors || err.message);
      } else {
        setUploadError(t("uploadError"));
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFeaturedPhotoChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    // Show the picked file immediately — no need to wait on the network round-trip to see it.
    if (featuredPhotoPreviewRef.current) {
      URL.revokeObjectURL(featuredPhotoPreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    featuredPhotoPreviewRef.current = previewUrl;
    setFeaturedPhotoPreviewUrl(previewUrl);

    setFeaturedPhotoError(null);
    setIsFeaturedPhotoUploading(true);
    try {
      const updated = await eventsApi.uploadFeaturedPhoto(params.id, file);
      setFeaturedPhotoUrl(updated.featuredPhotoUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setFeaturedPhotoError(fieldErrors || err.message);
      } else {
        setFeaturedPhotoError(t("uploadError"));
      }
    } finally {
      setIsFeaturedPhotoUploading(false);
    }
  }

  async function handleTogglePublish() {
    setPublishError(null);
    setIsPublishToggling(true);
    try {
      const updated = isPublished
        ? await eventsApi.unpublish(params.id)
        : await eventsApi.publish(params.id);
      setIsPublished(updated.isPublished);
    } catch {
      setPublishError(t("publishError"));
    } finally {
      setIsPublishToggling(false);
    }
  }

  async function handleGalleryImagesChange(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) {
      return;
    }
    // Show all picked files immediately, while they upload one by one in the background.
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviewUrls(previewUrls);

    setGalleryError(null);
    setIsGalleryUploading(true);
    try {
      for (const file of files) {
        const updated = await eventsApi.uploadGalleryImage(params.id, file);
        setGalleryImages(updated.galleryImages);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setGalleryError(fieldErrors || err.message);
      } else {
        setGalleryError(t("galleryUploadError"));
      }
    } finally {
      setIsGalleryUploading(false);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setGalleryPreviewUrls([]);
    }
  }

  async function handleRemoveGalleryImage(imageId: string) {
    if (!confirm(t("removeImageConfirm"))) {
      return;
    }
    setGalleryError(null);
    try {
      const updated = await eventsApi.removeGalleryImage(params.id, imageId);
      setGalleryImages(updated.galleryImages);
    } catch {
      setGalleryError(t("removeImageError"));
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col bg-[#FDFBF7]">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="flex flex-1 flex-col bg-[#FDFBF7]">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl">
            <Skeleton className="mb-6 h-8 w-40" />
            <Skeleton className="mb-6 h-20 w-full" />
            <Skeleton className="mb-6 h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <h1
          className="mb-6 font-serif text-2xl text-[#14211D]"
          style={{ fontWeight: 600 }}
        >
          {t("heading")}
        </h1>

        <div className="mb-6 border border-[#E2DFD3] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[#14211D]">
                {isPublished ? listT("published") : listT("draft")}
              </p>
              {isPublished && initialValues && (
                <a
                  href={`/e/${initialValues.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0F766E] underline transition-colors duration-150"
                >
                  /e/{initialValues.slug}
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={isPublishToggling}
              className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50"
            >
              {isPublishToggling ? t("saving") : isPublished ? t("unpublish") : t("publish")}
            </button>
          </div>
          {publishError && <p className="mt-2 text-xs text-red-600">{publishError}</p>}
        </div>

        {initialValues && <UpsellBanner eventId={params.id} eventType={initialValues.eventType} />}

        {initialValues && (
          <GuestListManager eventId={params.id} slug={initialValues.slug} eventName={initialValues.name} />
        )}

        <PhotoUpload
          label={photoT("gallery")}
          hint={photoT("galleryHint", { count: galleryImages.length })}
          multiple
          disabled={galleryImages.length >= 10}
          isUploading={isGalleryUploading}
          error={galleryError}
          onFilesSelected={handleGalleryImagesChange}
        >
          {(galleryImages.length > 0 || galleryPreviewUrls.length > 0) && (
            <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {galleryImages.map((image) => (
                <div key={image.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE_URL}${image.imageUrl}`}
                    alt={photoT("galleryAlt")}
                    className="h-24 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(image.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white transition-colors duration-150 hover:bg-black/80"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {galleryPreviewUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt={photoT("uploadingAlt")}
                  className="h-24 w-full rounded-md object-cover opacity-60"
                />
              ))}
            </div>
          )}
        </PhotoUpload>

        <PhotoUpload
          label={photoT("coverImage")}
          isUploading={isUploading}
          error={uploadError}
          onFilesSelected={handleCoverImageChange}
        >
          {(coverPreviewUrl || coverImageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreviewUrl ?? `${API_BASE_URL}${coverImageUrl}`}
              alt={photoT("coverAlt")}
              className="mb-2 h-40 w-full rounded-md object-cover"
            />
          )}
        </PhotoUpload>

        <PhotoUpload
          label={photoT("featuredPhoto")}
          hint={photoT("featuredPhotoHint")}
          isUploading={isFeaturedPhotoUploading}
          error={featuredPhotoError}
          onFilesSelected={handleFeaturedPhotoChange}
        >
          {(featuredPhotoPreviewUrl || featuredPhotoUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredPhotoPreviewUrl ?? `${API_BASE_URL}${featuredPhotoUrl}`}
              alt={photoT("featuredAlt")}
              className="mb-2 h-40 w-full rounded-md object-cover"
            />
          )}
        </PhotoUpload>

        <EventForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel={t("saveChanges")} />
      </div>
      </div>
    </div>
  );
}
