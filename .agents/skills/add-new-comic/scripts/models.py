from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

Speaker = Literal["narrator", "dev", "clanker"]
PanelShot = Literal["wide", "medium", "close", "over-the-shoulder"]
ReferenceCropMode = Literal["auto", "none"]
ControlGuideMode = Literal["layout", "canny", "raw"]
ArtPostprocessMode = Literal["terminal-lineart", "monochrome", "none"]


class DialogueLine(BaseModel):
    speaker: Speaker
    text: str = Field(min_length=1, max_length=180)


class PanelSpec(BaseModel):
    artPrompt: str = Field(
        min_length=1,
        description="Visual prompt for SDXL. Must describe the scene, acting, props, and mood. Do not include dialogue text.",
    )
    composition: str | None = Field(
        default=None,
        description="Short layout direction, e.g. 'dev left, clanker right, laptop foreground'.",
    )
    shot: PanelShot = "medium"
    dialogue: list[DialogueLine] = Field(default_factory=list, max_length=3)
    caption: str | None = Field(default=None, max_length=220)
    terminalLines: list[str] = Field(default_factory=list, max_length=4)
    controlImage: str | None = Field(
        default=None,
        description="Optional repo-relative ControlNet guide/sketch for this panel. Omit to auto-generate a simple layout guide.",
    )
    controlNetScale: float | None = Field(default=None, ge=0.0, le=2.0)
    negativePrompt: str | None = None
    seed: int | None = Field(default=None, ge=0)

    @field_validator("dialogue")
    @classmethod
    def require_dialogue_or_caption(cls, value: list[DialogueLine], info):
        # Cross-field validation is intentionally lenient here; the compositor can
        # render art-only, caption-only, or terminal-line panels without page chrome.
        return value


class GenerationConfig(BaseModel):
    modelId: str = "stabilityai/stable-diffusion-xl-base-1.0"
    ipAdapterRepo: str = "h94/IP-Adapter"
    ipAdapterSubfolder: str = "sdxl_models"
    ipAdapterWeight: str = "ip-adapter_sdxl.bin"
    ipAdapterScale: float = Field(default=0.82, ge=0.0, le=1.5)
    referenceImages: list[str] = Field(
        default_factory=lambda: [
            "art-reference/training-reference.png",
            "art-reference/ip-character-reference.png",
        ]
    )
    referenceCropMode: ReferenceCropMode = "auto"
    width: int = Field(default=1024, ge=512)
    height: int = Field(default=768, ge=512)
    steps: int = Field(default=34, ge=1, le=150)
    guidanceScale: float = Field(default=5.0, ge=0.0, le=30.0)
    enableControlNet: bool = True
    controlNetModelId: str = "diffusers/controlnet-canny-sdxl-1.0"
    controlGuideMode: ControlGuideMode = "layout"
    controlNetScale: float = Field(default=0.88, ge=0.0, le=2.0)
    controlNetStart: float = Field(default=0.0, ge=0.0, le=1.0)
    controlNetEnd: float = Field(default=0.90, ge=0.0, le=1.0)
    negativePrompt: str = (
        "photorealistic 3d glossy blurry glow text letters speech bubbles captions extra characters "
        "duplicates giant face malformed hands filled silhouettes thick fills clutter gray background "
        "gradient scanlines horizontal stripes noise random symbols floating artifacts windows wall panels "
        "posters reference sheet character sheet grid collage multiple panels user interface ui chrome "
        "browser window app window website dashboard title bar toolbar menu bar navbar header footer "
        "title banner status bar credits copyright logo watermark screenshot social media frame metadata"
    )
    artPostprocessMode: ArtPostprocessMode = "terminal-lineart"
    lineArtThreshold: int = Field(default=112, ge=0, le=255)
    lineArtStroke: int = Field(default=3, ge=1, le=6)
    seed: int | None = Field(default=None, ge=0)
    device: str = "cuda"
    torchDtype: Literal["float16", "bfloat16", "float32"] = "float16"
    enableVaeSlicing: bool = True
    enableVaeTiling: bool = True
    enableAttentionSlicing: bool = False
    enableSequentialCpuOffload: bool = False
    enableModelCpuOffload: bool = True

    @model_validator(mode="after")
    def validate_controlnet_window(self):
        if self.controlNetEnd < self.controlNetStart:
            raise ValueError("controlNetEnd must be greater than or equal to controlNetStart")
        return self


class ComicSpec(BaseModel):
    title: str = Field(min_length=1)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    timestamp: str = Field(default_factory=lambda: date.today().isoformat())
    credit: str | None = None
    summary: str | None = None
    generation: GenerationConfig = Field(default_factory=GenerationConfig)
    panels: list[PanelSpec] = Field(min_length=1, max_length=6)


def load_spec(path: Path) -> ComicSpec:
    return ComicSpec.model_validate_json(path.read_text(encoding="utf-8"))
