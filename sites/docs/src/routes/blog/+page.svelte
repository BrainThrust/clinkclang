<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<div class="container mx-auto py-8">
  <h1 class="text-4xl font-bold mb-8">Blog Posts</h1>
  
  <div class="grid gap-6">
    {#each data.posts as post}
      <article class="group">
        <a 
          href="/blog/{post.slug}" 
          class="block p-6 bg-card hover:bg-muted rounded-lg transition-colors"
        >
          <h2 class="text-2xl font-semibold group-hover:text-primary">
            {post.title}
          </h2>
          <time class="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString()}
          </time>
          {#if post.description}
            <p class="mt-2 text-muted-foreground">{post.description}</p>
          {/if}
        </a>
      </article>
    {/each}
  </div>
</div>
