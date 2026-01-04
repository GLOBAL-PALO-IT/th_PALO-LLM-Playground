---
applyTo: '**'
---
## Documentation Naming Convention

All documentation should be organized by topic/domain in the `docs/` directory:

- `docs/[topic/domain]/[document].md` - General format
- `docs/openai/` - OpenAI-related documentation
- `docs/implementation-summary/[epic]/[feature-name].md` - Implementation summaries for specific issues
- `docs/setup/` - Setup and installation guides
- `docs/advanced-search/` - Advanced search feature documentation
- `docs/authentication/` - Authentication and user management documentation

When creating new documentation:
1. Choose an appropriate topic/domain folder (create if needed)
2. Use lowercase with hyphens for folder names
3. Use descriptive file names that clearly indicate content
4. For implementation summaries, use: `implementation-summary/[epic]/[feature-name].md`(Do not use `implementation-summary/IMPLEMENTATION-SUMMARY.md`)
5. Update `docs/README.md` to include the new file in the structure