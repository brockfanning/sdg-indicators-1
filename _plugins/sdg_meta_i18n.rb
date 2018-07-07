module SDG_Meta_I18n
  class Generator < Jekyll::Generator
    def generate(site)
      site.config['languages'].each do |language|
        site.data['meta'].each do |indicator_id, meta|
          if meta[language]
            meta.each do |meta_key, meta_value|
              if meta_key != language && !meta[language][meta_key]
                meta[language][meta_key] = meta_value
              end
            end
          end
        end
      end
    end
  end
end
