import fs from "node:fs";
import * as yaml from "js-yaml";

const raw = JSON.parse(
  fs.readFileSync(".story-submission/parsed.json", "utf8"),
);

const form = {
  title: raw.story_title,
  organization: raw.organization,
  company_website: raw.company_website,
  project_website: raw.project_website || "",
  project_funding: raw.project_funding || "",
  funded_by: raw.funded_by || "",
  author: raw.author_name,
  location: raw.organization_location,
  tag_line: raw.tag_line || "",
  image: raw.image || "",
  summary: raw.summary || "",
  story: (raw.your_story || "")
    .replace(/^```markdown\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim(),
  industries: raw.industries || "",
  programming_languages: raw.programming_languages || "",
  platforms: raw.platforms || "",
  version_control_systems: raw.version_control_systems || "",
  build_tools: raw.build_tools || "",
  plugins: raw.plugins || "",
  community_supports: raw.community_support || "",
  teams: raw.teams || "",
  team_members: raw.team_members || "",
  quote: raw.quote || "",
  quote_from: raw.quote_author || "",
  quote_image: raw.quote_image || "",
};

if (!form.title) {
  throw new Error("Missing required field: story_title");
}

if (!form.author) {
  throw new Error("Missing required field: author_name");
}

if (!form.story) {
  throw new Error("Missing required field: your_story");
}

function array(id) {
  const value = form[id];

  if (!value) return [];

  if (Array.isArray(value)) return value;

  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const slug = slugify(form.title);

const storyDir = `src/user-story/${slug}`;

fs.mkdirSync(storyDir, {
  recursive: true,
});

const paragraphs = form.story
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter(Boolean);

const story = {
  title: form.title,

  post_name: slug,

  date: new Date().toISOString(),

  authored_by: form.author,

  tag_line: form.tag_line,

  image: form.image,

  metadata: {
    title: form.title,

    organization: form.organization,

    company_website: form.company_website,

    project_website: form.project_website,

    project_funding: form.project_funding,

    funded_by: form.funded_by,

    summary: form.summary,

    teams: array("teams"),

    team_members: array("team_members"),

    industries: array("industries"),

    programming_languages: array("programming_languages"),

    platforms: array("platforms"),

    version_control_systems: array("version_control_systems"),

    build_tools: array("build_tools"),

    plugins: array("plugins"),

    community_supports: array("community_supports"),
  },

  map: {
    authored_by: form.author,

    location: form.location,

    industries: array("industries"),

    geojson: "",
  },

  body_content: {
    title: form.title,

    paragraphs,
  },

  quotes: form.quote
    ? [
        {
          from: form.quote_from,
          content: form.quote,
          image: form.quote_image,
        },
      ]
    : [],
};

fs.writeFileSync(
  `${storyDir}/index.yaml`,
  yaml.dump(story, {
    lineWidth: -1,
    noRefs: true,
  }),
);

fs.mkdirSync(".story-submission", {
  recursive: true,
});

fs.writeFileSync(
  ".story-submission/output.json",
  JSON.stringify(
    {
      slug,
      path: `${storyDir}/index.yaml`,
    },
    null,
    2,
  ),
);

console.log(`Generated ${storyDir}/index.yaml`);