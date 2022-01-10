const changeYoutubeThumbnailSize = (url: string, size: number) =>
  url.replace(/(?!\=)s[0-9]+/, `s${size}`);

export default changeYoutubeThumbnailSize;
