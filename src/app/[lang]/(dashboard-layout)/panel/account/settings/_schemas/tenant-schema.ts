import { z } from "zod"

export const TenantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase and contain only letters, numbers, and hyphens"),
    domain: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    isActive: z.boolean().default(true),
})

export type TenantFormType = z.infer<typeof TenantSchema>
