import { z } from "zod/v4";

import { ImageEXIF } from "./image-exif.service";
import { Path, PathType } from "./path";
import { UrlWithoutTrailingSlashType } from "./url-wo-trailing-slash";

export const OpenGraphTitleValue = z.string().min(1);

export type OpenGraphTitleValueType = z.infer<typeof OpenGraphTitleValue>;

export const OpenGraphDescriptionValue = z.string().min(1);

export type OpenGraphDescriptionValueType = z.infer<typeof OpenGraphDescriptionValue>;

export const OpenGraphUrlValue = z.string().min(1);

export type OpenGraphUrlValueType = z.infer<typeof OpenGraphUrlValue>;

export const OpenGraphTypeValue = z.union([z.literal("website"), z.literal("article")]);

export type OpenGraphTypeValueType = z.infer<typeof OpenGraphTypeValue>;

export const OpenGraphImageUrlValue = z.url();

export type OpenGraphImageUrlValueType = z.infer<typeof OpenGraphImageUrlValue>;

export const OpenGraphImageTypeValue = z.string().min(1);

export type OpenGraphImageTypeValueType = z.infer<typeof OpenGraphImageTypeValue>;

export const OpenGraphImageWidthValue = z
  .number()
  .int()
  .positive()
  .refine((value) => value === 1200, {
    message: "open.graph.image.width.invalid",
  });

export type OpenGraphImageWidthValueType = z.infer<typeof OpenGraphImageWidthValue>;

export const OpenGraphImageHeightValue = z
  .number()
  .int()
  .positive()
  .refine((value) => value === 630, {
    message: "open.graph.image.height.invalid",
  });

export type OpenGraphImageHeightValueType = z.infer<typeof OpenGraphImageHeightValue>;

class OpenGraphTitle {
  private readonly value: OpenGraphTitleValueType;

  constructor(value: OpenGraphTitleValueType) {
    this.value = OpenGraphTitleValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:title" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphDescription {
  private readonly value: OpenGraphDescriptionValueType;

  constructor(value: OpenGraphDescriptionValueType) {
    this.value = OpenGraphDescriptionValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:description" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphUrl {
  private readonly value: OpenGraphUrlValueType;

  constructor(value: OpenGraphUrlValueType) {
    this.value = OpenGraphUrlValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:url" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphType {
  private readonly value: OpenGraphTypeValueType;

  constructor(value: OpenGraphTypeValueType) {
    this.value = OpenGraphTypeValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:type" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphImageUrl {
  private readonly value: OpenGraphImageUrlValueType;

  constructor(path: PathType) {
    this.value = OpenGraphImageUrlValue.parse(path);
  }

  toMetatag(): string {
    return `<meta property="og:image" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphImageType {
  private readonly value: OpenGraphImageTypeValueType;

  constructor(value: OpenGraphImageTypeValueType) {
    this.value = OpenGraphImageTypeValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:image:type" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphImageWidth {
  private readonly value: OpenGraphImageWidthValueType;

  constructor(value: OpenGraphImageWidthValueType) {
    this.value = OpenGraphImageWidthValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:image:width" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

class OpenGraphImageHeight {
  private readonly value: OpenGraphImageHeightValueType;

  constructor(value: OpenGraphImageHeightValueType) {
    this.value = OpenGraphImageHeightValue.parse(value);
  }

  toMetatag(): string {
    return `<meta property="og:image:height" content="${this.value}" />`;
  }

  toMeta(): string {
    return `${this.toMetatag()}\n\t`;
  }
}

export type OpenGraphImageConfigType = {
  url: OpenGraphImageUrl;
  width: OpenGraphImageWidth;
  height: OpenGraphImageHeight;
  type: OpenGraphImageType;
};

export class OpenGraphImage {
  private readonly value: OpenGraphImageConfigType;

  constructor(value: OpenGraphImageConfigType) {
    this.value = value;
  }

  toString() {
    let output = "";

    output += this.value.url.toMeta();
    output += this.value.width.toMeta();
    output += this.value.height.toMeta();
    output += this.value.type.toMeta();

    return output;
  }
}

class OpenGraphImageGenerator {
  static async generate(config: {
    path: PathType;
    BASE_URL: UrlWithoutTrailingSlashType;
  }) {
    const exif = await ImageEXIF.read(config.path);

    return new OpenGraphImage({
      url: new OpenGraph.image.url(Path.parse(`${config.BASE_URL}/${exif.name}`)),
      type: new OpenGraph.image.type(exif.mimeType),
      width: new OpenGraph.image.width(exif.width),
      height: new OpenGraph.image.height(exif.height),
    });
  }
}

type OpenGraphConfigType = {
  title: OpenGraphTitle;
  description: OpenGraphDescription;
  url: OpenGraphUrl;
  type: OpenGraphType;
  image?: OpenGraphImage;
};

class OpenGraphGenerator {
  static toString(config: OpenGraphConfigType) {
    let output = "";

    output += config.title.toMeta();
    output += config.description.toMeta();
    output += config.url.toMeta();
    output += config.type.toMeta();

    if (config.image) {
      output += config.image.toString();
    }

    return output;
  }
}

export const OpenGraph = {
  generator: OpenGraphGenerator,
  title: OpenGraphTitle,
  description: OpenGraphDescription,
  url: OpenGraphUrl,
  type: OpenGraphType,
  image: {
    generator: OpenGraphImageGenerator,
    url: OpenGraphImageUrl,
    width: OpenGraphImageWidth,
    height: OpenGraphImageHeight,
    type: OpenGraphImageType,
  },
};
