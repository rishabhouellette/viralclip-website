document.addEventListener('DOMContentLoaded',()=>{
  console.log('ViralClip scaffold ready');
  const form = document.querySelector('.beta-form');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      alert('Thanks! We\'ll be in touch.');
    });
  }
});