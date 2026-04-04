import React, { useEffect, useRef, useState } from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";
import Icon from "../components/Icon";
import PlantModal from "../components/PlantModal";
import StatusLegend from "../components/StatusLegend";
import {
  MAX_PLANTS,
  STATUS_LEGEND_ITEMS,
  createPlant,
  fileToBase64,
  formatRelativeTime,
  getPlantStatus,
  getPlantStatusMeta,
  waterPlantRecord,
} from "../utils/soilFlowState";

function createEmptyFormState() {
  return {
    id: "",
    name: "",
    desc: "",
    imagePreview: "",
    imageFile: null,
  };
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

export default function Plants({ plants, setPlants, onNavigate, notify }) {
  const [modalMode, setModalMode] = useState("");
  const [activePlantId, setActivePlantId] = useState("");
  const [deleteCandidateId, setDeleteCandidateId] = useState("");
  const [formState, setFormState] = useState(createEmptyFormState);
  const [formError, setFormError] = useState("");

  const plantFormRef = useRef(null);
  const plantImageInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const activePlant = plants.find((plant) => plant.id === activePlantId) || null;
  const dryPlants = plants.filter((plant) => getPlantStatus(plant.moisture) === "dry").length;

  useEffect(() => () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, []);

  function showNotification(type, title, message) {
    notify?.({ type, title, message });
  }

  function revokePreviewUrl(url = previewUrlRef.current) {
    if (typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }

    if (url === previewUrlRef.current) {
      previewUrlRef.current = "";
    }
  }

  function resetFileInput() {
    if (plantImageInputRef.current) {
      plantImageInputRef.current.value = "";
    }
  }

  function resetForm() {
    revokePreviewUrl();
    resetFileInput();
    setFormState(createEmptyFormState());
    setFormError("");
  }

  function closePlantModal() {
    resetForm();
    setModalMode("");
    setActivePlantId("");
    setDeleteCandidateId("");
  }

  function openAddPlantForm() {
    if (plants.length >= MAX_PLANTS) {
      showNotification("error", "Plant limit reached", "Maximum of 8 plants only");
      return;
    }

    resetForm();
    setActivePlantId("");
    setModalMode("create");
  }

  function openPlantDetails(id) {
    const plant = plants.find((item) => item.id === id);
    if (!plant) {
      return;
    }

    resetFileInput();
    setFormError("");
    setActivePlantId(id);
    setModalMode("details");
  }

  function openEditPlantForm() {
    if (!activePlant) {
      return;
    }

    resetFileInput();
    revokePreviewUrl();
    setFormError("");
    setFormState({
      id: activePlant.id,
      name: activePlant.name,
      desc: activePlant.desc,
      imagePreview: activePlant.image,
      imageFile: null,
    });
    setModalMode("edit");
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      revokePreviewUrl();
      previewUrlRef.current = previewUrl;

      setFormState((currentState) => ({
        ...currentState,
        imagePreview: previewUrl,
        imageFile: file,
      }));
      setFormError("");
    } catch (error) {
      console.warn("Unable to read the selected image.", error);
      setFormError("Unable to read the selected image.");
      showNotification("error", "Image unavailable", "Unable to read the selected image.");
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  }

  async function getPlantPayload(existingImage = "") {
    const name = formState.name.trim();
    const desc = formState.desc.trim();
    let image = existingImage;

    if (formState.imageFile) {
      try {
        image = await fileToBase64(formState.imageFile);
      } catch (error) {
        console.warn("Unable to read the selected image.", error);
        setFormError("Unable to read the selected image.");
        showNotification("error", "Image unavailable", "Unable to read the selected image.");
        return null;
      }
    }

    if (!image || !name || !desc) {
      setFormError("Please complete all required fields.");
      showNotification("error", "Missing information", "Please complete all required fields.");
      return null;
    }

    return { image, name, desc };
  }

  async function addPlant() {
    if (plants.length >= MAX_PLANTS) {
      showNotification("error", "Plant limit reached", "Maximum of 8 plants only");
      return;
    }

    const payload = await getPlantPayload();
    if (!payload) {
      return;
    }

    const newPlant = createPlant(payload, plants.length);

    setPlants((currentPlants) => [...currentPlants, newPlant]);
    resetForm();
    setActivePlantId(newPlant.id);
    setModalMode("details");
    showNotification("success", "Plant saved", `${newPlant.name} was added to your collection.`);
  }

  async function updatePlant(id) {
    const currentPlant = plants.find((plant) => plant.id === id);
    if (!currentPlant) {
      return;
    }

    const payload = await getPlantPayload(currentPlant.image);
    if (!payload) {
      return;
    }

    setPlants((currentPlants) =>
      currentPlants.map((plant) =>
        plant.id === id
          ? {
              ...plant,
              image: payload.image,
              name: payload.name,
              desc: payload.desc,
            }
          : plant,
      ),
    );

    resetForm();
    setActivePlantId(id);
    setModalMode("details");
    showNotification("success", "Plant updated", `${payload.name} was updated successfully.`);
  }

  function requestDeletePlant(id) {
    if (!id) {
      return;
    }
    setDeleteCandidateId(id);
  }

  function cancelDeletePlant() {
    setDeleteCandidateId("");
  }

  function deletePlant(id) {
    if (!id) {
      return;
    }

    setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== id));
    setDeleteCandidateId("");
    closePlantModal();
    showNotification("success", "Plant deleted", "The plant was removed from your collection.");
  }

  function waterPlant(id) {
    if (!id) {
      return;
    }

    setPlants((currentPlants) =>
      currentPlants.map((plant) => (plant.id === id ? waterPlantRecord(plant) : plant)),
    );
    setModalMode("details");
    showNotification("success", "Water applied", "The plant was marked as recently watered.");
  }

  async function handlePlantFormSubmit(event) {
    event.preventDefault();

    if (formState.id) {
      await updatePlant(formState.id);
      return;
    }

    await addPlant();
  }

  function renderPlantCards() {
    if (!plants.length) {
      return (
        <div className="md:col-span-2 rounded-[1.25rem] border border-dashed border-border bg-card/70 p-5 text-center text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <Icon icon="solar:leaf-linear" className="size-8 text-primary/50" />
            <p>No plants saved yet. Add your first plant to start tracking it.</p>
            <button
              type="button"
              onClick={openAddPlantForm}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <Icon icon="hugeicons:add-01" className="size-4" />
              <span>Add Plant</span>
            </button>
          </div>
        </div>
      );
    }

    return plants.map((plant) => {
      const statusMeta = getPlantStatusMeta(plant.moisture);

      return (
        <button
          key={plant.id}
          type="button"
          onClick={() => openPlantDetails(plant.id)}
          className={`relative flex w-full items-center gap-4 overflow-hidden rounded-[1.25rem] border ${statusMeta.borderClass} bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]`}
        >
          <div className={`absolute inset-0 opacity-80 ${statusMeta.surfaceClass}`} />
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/50">
            <img src={plant.image} alt={plant.name} className="h-full w-full object-cover" />
          </div>
          <div className="relative z-10 min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h4 className="truncate font-heading text-base font-semibold text-foreground">
                {plant.name}
              </h4>
              <span
                className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusMeta.badgeClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`} />
                {statusMeta.shortLabel}
              </span>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">{truncateText(plant.desc, 96)}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
              <span>Moisture {plant.moisture}%</span>
              <span className="text-right">Watered {formatRelativeTime(plant.lastWateredAt)}</span>
            </div>
          </div>
        </button>
      );
    });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="mobile-card rounded-[1.25rem] border border-border bg-gradient-to-br from-secondary to-card p-4 shadow-md sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">Plant Dashboard</p>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
              Monitored Plants
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add, edit, water, and review every plant from one focused workspace. Your data is stored locally so the dashboard stays ready after refresh.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="self-start rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Back Home
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Your Collection
              </h3>
              <p className="text-xs text-muted-foreground">Store up to 8 plants on this device</p>
            </div>
            <StatusLegend items={STATUS_LEGEND_ITEMS} />
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {plants.length} Active
            </span>
            <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
              {dryPlants} Dry
            </span>
            <button
              type="button"
              onClick={openAddPlantForm}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <Icon icon="hugeicons:add-01" className="size-4" />
              <span>Add Plant</span>
            </button>
          </div>
        </div>

        <div className="soilflow-scrollbar grid gap-4 md:grid-cols-2 lg:max-h-[38rem] lg:overflow-y-auto lg:pr-1">
          {renderPlantCards()}
        </div>
      </div>

      <PlantModal
        isOpen={modalMode !== ""}
        mode={modalMode}
        activePlant={activePlant}
        formState={formState}
        formError={formError}
        onClose={closePlantModal}
        onEdit={openEditPlantForm}
        onDelete={() => requestDeletePlant(activePlant?.id)}
        onWater={() => waterPlant(activePlant?.id)}
        onSubmit={handlePlantFormSubmit}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        plantFormRef={plantFormRef}
        plantImageInputRef={plantImageInputRef}
      />

      <ConfirmationDialog
        isOpen={Boolean(deleteCandidateId)}
        title="Delete Plant"
        message="Are you sure you want to delete this plant?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={cancelDeletePlant}
        onConfirm={() => deletePlant(deleteCandidateId)}
      />
    </div>
  );
}
