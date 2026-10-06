/** Admin → Users (super admin only) copy. */
export const usersData = {
  meta: { title: "Users" },
  eyebrow: "Administration",
  title: "Admin users",
  highlight: "users",
  intro: "Who can sign in to this dashboard. Admins manage the inbox and content; super admins also manage users and see the audit log.",

  create: {
    heading: "Add a user",
    intro: "A temporary password is generated for them. Share it privately — they'll be asked to choose their own after signing in.",
    name: "Name",
    email: "Email",
    role: "Role",
    submit: "Create user",
    submitting: "Creating…",
  },

  temp: {
    heading: (name) => `Temporary password for ${name}`,
    note: "Shown only once. Copy it now and send it privately (phone or in person — not in a group chat).",
    copy: "Copy",
    copied: "Copied",
    done: "Done",
  },

  list: {
    heading: "Users",
    you: "You",
    lastLogin: "Last sign-in",
    never: "Never",
    active: "Active",
    disabled: "Disabled",
    locked: "Locked out",
    mustChange: "Temporary password",
    changeRole: "Change role",
    saveRole: "Save",
    disable: "Disable",
    enable: "Enable",
    reset: "Reset password",
    unlock: "Unlock",
    selfHint: "Manage your own account under Account.",
    disableConfirm: (name) => `Disable ${name}? They are signed out immediately and can't sign in until re-enabled.`,
    resetConfirm: (name) => `Reset the password for ${name}? They are signed out everywhere and get a new temporary password.`,
  },

  errors: {
    invalid: "Please check the highlighted fields.",
    emailTaken: "There is already a user with that email.",
    self: "You can't change your own account here — use Account.",
    lastSuper: "There must always be at least one active super admin.",
    notFound: "That user no longer exists.",
    server: "Something went wrong on our side. Please try again.",
    required: "This field is required.",
    name: "Use 2–80 characters.",
  },
};
