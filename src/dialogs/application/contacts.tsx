import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PlusIcon, TrashIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";
import type { DialogProps } from "../store";

const contactFormSchema = z.object({
	name: z.string().min(1).max(255),
	role: z.string().max(100).optional(),
	email: z.string().email().or(z.literal("")).optional(),
	phone: z.string().max(30).optional(),
	linkedinUrl: z.string().url().or(z.literal("")).optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactsDialog({ data }: DialogProps<"application.contacts">) {
	const queryClient = useQueryClient();

	const { data: contacts, isLoading } = useQuery(
		orpc.application.contacts.list.queryOptions({ input: { applicationId: data.id } }),
	);

	const { mutate: createContact, isPending: isCreating } = useMutation(
		orpc.application.contacts.create.mutationOptions(),
	);

	const { mutate: deleteContact } = useMutation(orpc.application.contacts.delete.mutationOptions());

	const form = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: { name: "", role: "", email: "", phone: "", linkedinUrl: "" },
	});

	const onAddContact = (values: ContactFormValues) => {
		createContact(
			{
				applicationId: data.id,
				name: values.name,
				role: values.role || null,
				email: values.email || null,
				phone: values.phone || null,
				linkedinUrl: values.linkedinUrl || null,
			},
			{
				onSuccess: () => {
					toast.success(t`Contact added.`);
					queryClient.invalidateQueries(
						orpc.application.contacts.list.queryOptions({ input: { applicationId: data.id } }),
					);
					form.reset();
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	const onDeleteContact = (contactId: string) => {
		deleteContact(
			{ id: contactId, applicationId: data.id },
			{
				onSuccess: () => {
					toast.success(t`Contact removed.`);
					queryClient.invalidateQueries(
						orpc.application.contacts.list.queryOptions({ input: { applicationId: data.id } }),
					);
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	return (
		<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<UsersThreeIcon />
					<Trans>Contacts</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Manage contacts for this application.</Trans>
				</DialogDescription>
			</DialogHeader>

			{isLoading ? (
				<div className="space-y-3">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			) : (
				<div className="space-y-3">
					{contacts?.map((contact) => (
						<div key={contact.id} className="flex items-center justify-between rounded-lg border p-3">
							<div className="min-w-0">
								<p className="font-medium text-sm">{contact.name}</p>
								{contact.role && <p className="text-muted-foreground text-xs">{contact.role}</p>}
								{contact.email && <p className="text-muted-foreground text-xs">{contact.email}</p>}
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="size-7 shrink-0 text-destructive"
								onClick={() => onDeleteContact(contact.id)}
							>
								<TrashIcon className="size-3.5" />
							</Button>
						</div>
					))}

					{contacts?.length === 0 && (
						<p className="py-4 text-center text-muted-foreground text-sm">
							<Trans>No contacts yet.</Trans>
						</p>
					)}
				</div>
			)}

			<Separator />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onAddContact)} className="space-y-3">
					<p className="font-medium text-sm">
						<Trans>Add Contact</Trans>
					</p>

					<div className="grid grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Name</Trans>
									</FormLabel>
									<FormControl>
										<Input placeholder={t`e.g. Jane Smith`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Role</Trans>
									</FormLabel>
									<FormControl>
										<Input placeholder={t`e.g. Recruiter`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Email</Trans>
								</FormLabel>
								<FormControl>
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<Trans>Phone</Trans>
								</FormLabel>
								<FormControl>
									<Input type="tel" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="linkedinUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel>LinkedIn</FormLabel>
								<FormControl>
									<Input type="url" placeholder="https://linkedin.com/in/..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" size="sm" disabled={isCreating}>
						<PlusIcon className="mr-1 size-3.5" />
						<Trans>Add</Trans>
					</Button>
				</form>
			</Form>
		</DialogContent>
	);
}
