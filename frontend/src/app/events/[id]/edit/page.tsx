"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EventForm, type EventFormValues } from "@/components/EventForm";
import { ApiError } from "@/lib/auth-context";
import { eventsApi } from "@/lib/eventsApi";
import type { CreateEventRequest, EventImageRecord, EventRecord } from "@/types/event";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<EventFormValues | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishToggling, setIsPublishToggling] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<EventImageRecord[]>([]);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  function applyEvent(event: EventRecord) {
    setInitialValues({
      name: event.name,
      slug: event.slug,
      eventType: event.eventType,
      eventDate: event.eventDate.slice(0, 10),
      description: event.description ?? "",
      address: event.address ?? "",
      templateId: event.templateId,
    });
    setCoverImageUrl(event.coverImageUrl);
    setIsPublished(event.isPublished);
    setGalleryImages(event.galleryImages);
  }

  useEffect(() => {
    eventsApi
      .get(params.id)
      .then(applyEvent)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError("Event not found.");
        } else {
          setError("Could not load this event.");
        }
      });
  }, [params.id]);

  async function handleSubmit(request: CreateEventRequest) {
    await eventsApi.update(params.id, request);
    router.push("/events");
  }

  async function handleCoverImageChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
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
        setUploadError("Could not upload the image.");
      }
    } finally {
      setIsUploading(false);
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
      setPublishError("Could not update the publish status.");
    } finally {
      setIsPublishToggling(false);
    }
  }

  async function handleGalleryImagesChange(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) {
      return;
    }
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
        setGalleryError("Could not upload one or more images.");
      }
    } finally {
      setIsGalleryUploading(false);
    }
  }

  async function handleRemoveGalleryImage(imageId: string) {
    setGalleryError(null);
    try {
      const updated = await eventsApi.removeGalleryImage(params.id, imageId);
      setGalleryImages(updated.galleryImages);
    } catch {
      setGalleryError("Could not remove the image.");
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#FDFBF7] dark:bg-[#0F1714]">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#FDFBF7] dark:bg-[#0F1714]">
        <p className="text-[#5B6B67] dark:text-[#9CA9A5]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#FDFBF7] px-6 py-16 dark:bg-[#0F1714]">
      <div className="w-full max-w-sm">
        <h1
          className="mb-6 font-serif text-2xl text-[#14211D] dark:text-[#F3F1EA]"
          style={{ fontWeight: 600 }}
        >
          Edit event
        </h1>

        <div className="mb-6 border border-[#E2DFD3] p-4 dark:border-[#2A3532]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[#14211D] dark:text-[#F3F1EA]">
                {isPublished ? "Published" : "Draft"}
              </p>
              {isPublished && initialValues && (
                <a
                  href={`/e/${initialValues.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0F766E] underline dark:text-[#14B8A6]"
                >
                  /e/{initialValues.slug}
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={isPublishToggling}
              className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0C5C56] disabled:opacity-50 dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
            >
              {isPublishToggling ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
          {publishError && <p className="mt-2 text-xs text-red-600">{publishError}</p>}
        </div>

        <div className="mb-6">
          <span className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
            Gallery
          </span>
          {galleryImages.length > 0 && (
            <div className="mb-2 grid grid-cols-3 gap-2">
              {galleryImages.map((image) => (
                <div key={image.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE_URL}${image.imageUrl}`}
                    alt="Gallery"
                    className="h-20 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(image.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={isGalleryUploading || galleryImages.length >= 10}
            onChange={(e) => handleGalleryImagesChange(e.target.files)}
            className="w-full text-sm text-[#5B6B67] dark:text-[#9CA9A5]"
          />
          {isGalleryUploading && <p className="mt-1 text-xs text-[#5B6B67] dark:text-[#9CA9A5]">Uploading...</p>}
          {galleryError && <p className="mt-1 text-xs text-red-600">{galleryError}</p>}
        </div>

        <div className="mb-6">
          <span className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
            Cover image
          </span>
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_BASE_URL}${coverImageUrl}`}
              alt="Event cover"
              className="mb-2 h-32 w-full rounded-md object-cover"
            />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={(e) => handleCoverImageChange(e.target.files)}
            className="w-full text-sm text-[#5B6B67] dark:text-[#9CA9A5]"
          />
          {isUploading && <p className="mt-1 text-xs text-[#5B6B67] dark:text-[#9CA9A5]">Uploading...</p>}
          {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        </div>

        <EventForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Save changes" />
      </div>
    </div>
  );
}
