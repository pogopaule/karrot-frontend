<template>
  <div>
    <div
      class="row no-wrap items-center justify-between bg-white q-px-sm q-py-xs"
    >
      <QSelect
        v-model="status"
        :options="statusOptions"
        emit-value
        map-options
        outlined
        hide-bottom-space
        dense
      />
    </div>
    <KSpinner v-show="fetching" />
    <div class="row">
      <div
        v-if="status === 'active' && !fetching"
        class="col-md-4 col-6 new-offer"
      >
        <QCard>
          <QImg
            basic
            :ratio="4/3"
          />
          <QItem style="min-height: 57px;" />
          <RouterLink
            class="absolute-center fit"
            :to="{ name: 'offerCreate' }"
            :title="$t('OFFER.CREATE_TITLE')"
          >
            <QIcon
              size="5em"
              class="fit"
              name="fas fa-plus"
            />
          </RouterLink>
        </QCard>
      </div>
      <div
        v-for="offer in offers"
        :key="offer.id"
        class="col-md-4 col-6"
      >
        <RouterLink :to="detailRouteFor(offer.id)">
          <QCard
            class="cursor-pointer"
            :title="offer.name"
          >
            <QImg
              basic
              :src="offer.images[0].imageUrls.fullSize"
              :ratio="4/3"
            />
            <QItem clickable>
              <QItemSection avatar>
                <ProfilePicture
                  :user="offer.user"
                  :size="36"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel class="ellipsis full-width">
                  {{ offer.name }}
                </QItemLabel>
                <QItemLabel class="ellipsis full-width">
                  <DateAsWords
                    :date="offer.createdAt"
                    class="text-caption"
                  />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QCard>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { QIcon, QSelect, QCard, QItem, QItemSection, QItemLabel, QImg } from 'quasar'
import ProfilePicture from '@/users/components/ProfilePicture'
import KSpinner from '@/utils/components/KSpinner'
import bindRoute from '@/utils/mixins/bindRoute'
import { DEFAULT_STATUS } from '@/offers/datastore/offers'
import DateAsWords from '@/utils/components/DateAsWords'

export default {
  components: {
    DateAsWords,
    ProfilePicture,
    KSpinner,
    QIcon,
    QSelect,
    QCard,
    QItem,
    QItemSection,
    QItemLabel,
    QImg,
  },
  mixins: [
    bindRoute({
      status: DEFAULT_STATUS,
    }),
  ],
  data () {
    return {
      statusOptions: [
        {
          label: this.$t('OFFER.FILTER.STATUS.ACTIVE'),
          value: 'active',
        },
        {
          label: this.$t('OFFER.FILTER.STATUS.ACCEPTED'),
          value: 'accepted',
        },
        {
          label: this.$t('OFFER.FILTER.STATUS.ARCHIVED'),
          value: 'archived',
        },
      ],
    }
  },
  computed: {
    ...mapGetters({
      offers: 'offers/all',
      fetching: 'offers/fetching',
    }),
  },
  watch: {
    status: {
      immediate: true,
      handler (status) {
        this.fetchList({ status })
      },
    },
  },
  methods: {
    ...mapActions({
      fetchList: 'offers/fetchList',
    }),
    detailRouteFor (offerId) {
      return {
        name: 'offerDetail',
        params: { offerId },
        query: this.$route.query,
      }
    },
  },
}
</script>