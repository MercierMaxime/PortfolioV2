<template>
  <div>
    <form>
      <label>From name</label>
      <input type="text" v-model="from_name">
      <label>Email ID</label>
      <input type="email" v-model="email_id">
      <label>Message</label>
      <textarea v-model="message"></textarea>
      <button type="submit" @click.prevent="sendMail">Send</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      from_name: "",
      email_id: "",
      message: "",
    };
  },
  methods: {
    sendMail() {
      const params = {
        from_name: this.from_name,
        email_id: this.email_id,
        message: this.message,
      };
      emailjs
        .send("service_430dq2r", "template_15d9h0l", params)
        .then(res => {
          alert(`Success! ${res.status}`);
        })
        .catch(err => {
          alert(`Error: ${err}`);
        });
    },
  },
};
</script>
